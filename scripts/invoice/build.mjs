// Builds the OnTable invoice or quotation in three formats (.md, .docx, .pdf) from one data object.
// Run: NODE_PATH=<dir with docx installed> node scripts/invoice/build.mjs [colgate] [quotation]
// PDF is printed by headless Chrome from an HTML page that uses the site's own fonts.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const docx = require("docx");

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const outDir = path.join(root, "docs/invoice");

// ---------------------------------------------------------------- data
const data = {
	studio: {
		name: "OnTable Studio",
		tagline: "From our table to yours.",
		email: "ontablestudio@gmail.com",
		itch: "ontable-studio.itch.io",
	},
	number: "INV/ONT/2026/10/001",
	date: "28 Oktober 2026",
	valid: "2 November 2026",
	client: {
		name: "[Nama Klien / Perusahaan]",
		attn: "[Nama Penanggung Jawab]",
		address: "[Alamat lengkap klien]",
		contact: "[Email / No. telepon klien]",
		npwp: "[NPWP klien, jika ada]",
	},
	project: "[Nama proyek / referensi PO atau penawaran]",
	projectDesc: "[Deskripsi singkat proyek, layanan, atau barang]",
	items: [
		{ desc: "[Deskripsi layanan / pekerjaan]", link: "", detail: "[Rincian lingkup, jika perlu]", qty: 1, unit: "paket", price: 0 },
	],
	discount: 0,
	taxRate: 0, // isi 11 bila dikenakan PPN
	pph: null, // { rate, label }: PPh 21 dipotong klien, harga digross-up supaya nilai bersih tetap
	bank: {
		name: "Bank Central Asia (BCA)",
		holder: "Ahmad Fachrozi Suhand",
		no: "5865405356",
		confirm: "081382711025",
	},
	signer: "Ahmad Fachrozi Suhand",
	signerRole: "Lead OnTable Studio",
	approver: "[Nama penyetuju]",
};

// `node build.mjs colgate` fills the same template with the Colgate booth project.
const Q = process.argv.includes("quotation");
let BASE = "Invoice-OnTable-INV-ONT-2026-10-001";
if (process.argv.includes("colgate")) {
	BASE = "Invoice-OnTable-Colgate-INV-ONT-2026-10-001";
	Object.assign(data, {
		client: {
			name: "PT Scarlet Kreasi Indonesia",
			attn: "Frezi Andika",
			address: "Jl. Cirendeu Indah III No.14, Cireundeu, Kec. Ciputat Timur, Kota Tangerang Selatan, Banten 15419",
			contact: "Telp. 0812-6129-7358",
			npwp: "",
		},
		approver: "Frezi Andika",
		valid: "6 November 2026",
		// the quotation keeps the default date; the invoice is issued on the 31st
		...(Q ? {} : { date: "31 Oktober 2026" }),
		project: "Colgate 95% Vitamin C Blast",
		projectDesc: "Pembuatan game booth 95% Vitamin C Blast untuk kampanye Colgate Optic White Vitamin C (event 28 Oktober - 1 November 2026).",
		items: [
			{
				desc: "Pengembangan game 95% Vitamin C Blast",
				link: "https://colgate-omega.vercel.app",
				detail: "Pembuatan game booth layar sentuh untuk TV 43 inci: pemain menembak (tap) molekul Vitamin C.",
				qty: 1,
				unit: "paket",
				price: 4000000,
			},
		],
		// PPh 21 jasa non-pegawai dengan NPWP: tarif Pasal 17 (5%) x DPP 50% dari bruto = 2,5% bruto
		pph: { rate: 0.025, label: "Pajak (PPh 21)" },
	});
}
if (Q) {
	data.number = "QUO/ONT/2026/10/001";
	BASE = BASE.replace("Invoice-", "Penawaran-").replace("INV-", "QUO-");
}
const T = Q
	? { title: "PENAWARAN", to: "Ditujukan kepada", total: "Total penawaran", noLbl: "No. Penawaran", dateLbl: "Tanggal penawaran", doc: "Penawaran" }
	: { title: "INVOICE", to: "Ditagihkan kepada", total: "Total tagihan", noLbl: "No. Invoice", dateLbl: "Tanggal penagihan", doc: "Invoice" };

const clauses = Q
	? [
			"Penawaran berlaku sampai tanggal yang tertera; setelahnya harga dapat disesuaikan.",
			"Harga berlaku untuk lingkup pekerjaan di atas; pekerjaan di luar lingkup dihitung terpisah.",
			"Penawaran mengikat setelah ditandatangani atau dikonfirmasi tertulis oleh Klien.",
			"Pembayaran dilakukan melalui transfer sesuai invoice yang diterbitkan OnTable Studio.",
			"Hak pakai hasil pekerjaan beralih kepada Klien setelah lunas, kecuali ditentukan lain dalam perjanjian.",
		]
	: [
			"Pembayaran dilakukan secara penuh melalui transfer ke rekening di atas.",
			"Cantumkan nomor invoice pada berita transfer dan kirim bukti transfer ke nomor konfirmasi.",
			"Biaya transfer dan biaya bank ditanggung pembayar, sehingga Penerbit menerima nominal penuh.",
			"Pembayaran yang telah diterima tidak dapat dikembalikan, kecuali disepakati tertulis.",
			"Hak pakai hasil pekerjaan beralih kepada Klien setelah lunas, kecuali ditentukan lain dalam perjanjian.",
		];
if (data.pph) {
	clauses.splice(
		Q ? 3 : 2,
		0,
		"PPh 21 dipotong Klien dan disetor ke negara; bukti potong diserahkan kepada OnTable Studio.",
	);
}

// ---------------------------------------------------------------- numbers
const idr = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
const subtotal = data.items.reduce((s, i) => s + i.qty * i.price, 0);
const afterDiscount = subtotal - data.discount;
const tax = Math.round((afterDiscount * data.taxRate) / 100);
const total = afterDiscount + tax;
// harga termasuk PPh 21: nilai bersih dibagi (1 - tarif efektif)
const grossWithPph = data.pph ? Math.round(total / (1 - data.pph.rate)) : total;
const pphAmount = grossWithPph - total;
const pphPct = data.pph ? String(data.pph.rate * 100).replace(".", ",") : "";

const SATUAN = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
function say(n) {
	if (n < 12) return SATUAN[n];
	if (n < 20) return say(n - 10) + " belas";
	if (n < 100) return say(Math.floor(n / 10)) + " puluh" + (n % 10 ? " " + say(n % 10) : "");
	if (n < 200) return "seratus" + (n > 100 ? " " + say(n - 100) : "");
	if (n < 1000) return say(Math.floor(n / 100)) + " ratus" + (n % 100 ? " " + say(n % 100) : "");
	if (n < 2000) return "seribu" + (n > 1000 ? " " + say(n - 1000) : "");
	if (n < 1e6) return say(Math.floor(n / 1000)) + " ribu" + (n % 1000 ? " " + say(n % 1000) : "");
	if (n < 1e9) return say(Math.floor(n / 1e6)) + " juta" + (n % 1e6 ? " " + say(n % 1e6) : "");
	if (n < 1e12) return say(Math.floor(n / 1e9)) + " miliar" + (n % 1e9 ? " " + say(n % 1e9) : "");
	return say(Math.floor(n / 1e12)) + " triliun" + (n % 1e12 ? " " + say(n % 1e12) : "");
}
const terbilang = grossWithPph === 0 ? "Nol rupiah" : say(grossWithPph).replace(/^./, (c) => c.toUpperCase()) + " rupiah";

// brand tokens (src/styles/main.css)
const C = {
	orange500: "F5611F", orange600: "DC4A0F", orange50: "FFF3EC", orange100: "FFE0CF",
	ink50: "F7F5F3", ink100: "EBE7E3", ink200: "D6D0C9", ink400: "8C847B", ink500: "6B645C", ink700: "3B3733", ink900: "171513",
};

const pphNote = data.pph
	? `${data.pph.label}: ${pphPct}% dari harga termasuk pajak (tarif Pasal 17 sebesar 5% dari DPP 50%). Dipotong Klien dan disetor ke negara; OnTable Studio menerima bersih ${idr(total)}.`
	: "";

// ---------------------------------------------------------------- markdown
function buildMd() {
	const d = data;
	const rows = d.items
		.map((i, n) => `| ${n + 1} | **${i.desc}**${i.link ? `<br>Link game: ${i.link}` : ""}${i.detail ? `<br>${i.detail}` : ""} | ${i.qty} ${i.unit} | ${idr(i.price)} | ${idr(i.qty * i.price)} |`)
		.join("\n");
	return `<p align="center"><img src="../../public/images/ontable-logo.svg" alt="OnTable" width="96"></p>

# ${T.title}

**${d.studio.name}** · ${d.studio.tagline}
${d.studio.email}

---

| | |
| --- | --- |
| **${T.noLbl}** | ${d.number} |
| **${T.dateLbl}** | ${d.date} |
| **Berlaku sampai** | ${d.valid} |
| **Proyek** | ${d.project} |

## ${T.to}

**${d.client.name}**
U.p. ${d.client.attn}
${d.client.address}
${d.client.contact}${d.client.npwp ? `\nNPWP: ${d.client.npwp}` : ""}

## Deskripsi Proyek

${d.projectDesc}

## Rincian

| No | Deskripsi | Jumlah | Harga Satuan | Total |
| --: | --- | --- | ---: | ---: |
${rows}

| | |
| --- | ---: |
| Subtotal | ${idr(subtotal)} |${d.discount ? `\n| Diskon | - ${idr(d.discount)} |` : ""}${d.taxRate ? `\n| PPN ${d.taxRate}% | ${idr(tax)} |` : ""}
${data.pph ? `| ${data.pph.label} | ${idr(pphAmount)} |\n` : ""}| **${(data.pph ? "Harga termasuk pajak" : T.total).toUpperCase()}** | **${idr(grossWithPph)}** |

**Terbilang:** _${terbilang}_

${Q ? "" : `## Informasi Pembayaran

| | |
| --- | --- |
| **Bank** | ${d.bank.name} |
| **Atas Nama** | ${d.bank.holder} |
| **No. Rekening** | \`${d.bank.no}\` |
| **Konfirmasi** | \`${d.bank.confirm}\` |

`}## Syarat dan Ketentuan

${clauses.map((c, n) => `${n + 1}. ${c}`).join("\n")}

## Pengesahan

Hormat kami,
**${d.studio.name}**

<br><br><br>

**${d.signer}**
${d.signerRole}
${Q ? `
Disetujui oleh Klien,
**${d.client.name}**

<br><br><br>

**${d.approver}**
` : ""}
---

_Terima kasih atas kepercayaan Anda kepada ${d.studio.name}._
`;
}

// ---------------------------------------------------------------- pdf (html)
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
function buildHtml() {
	const d = data;
	const nm = path.join(root, "node_modules");
	const url = (p) => pathToFileURL(path.join(nm, p)).href;
	const logo = pathToFileURL(path.join(here, "logo.svg")).href;
	const rows = d.items
		.map(
			(i) => `<tr><td><b>${esc(i.desc)}</b>${i.link ? `<div class="link">Link game: <a href="${i.link}">${esc(i.link)}</a></div>` : ""}${i.detail ? `<p class="detail">${esc(i.detail)}</p>` : ""}</td><td class="c">${i.qty} ${i.unit}</td><td class="r mono">${idr(i.price)}</td><td class="r mono">${idr(i.qty * i.price)}</td></tr>`,
		)
		.join("");
	const sign = (head, name, who, role) => `<div class="sign"><div class="k">${head}</div><div class="who">${esc(name)}</div><div class="sp"></div><b>${esc(who)}</b>${role ? `<div class="role">${esc(role)}</div>` : ""}</div>`;
	const left = Q
		? sign("Hormat kami,", d.studio.name, d.signer, d.signerRole)
		: `<div class="k">Informasi pembayaran</div><dl><dt>Bank</dt><dd>${esc(d.bank.name)}</dd><dt>Atas nama</dt><dd>${esc(d.bank.holder)}</dd><dt>No. rekening</dt><dd class="mono">${d.bank.no}</dd><dt>Konfirmasi</dt><dd class="mono">${d.bank.confirm}</dd></dl>`;
	const right = Q ? sign("Mohon konfirmasi persetujuan penawaran ini:", d.client.name, d.approver, "") : sign("Hormat kami,", d.studio.name, d.signer, d.signerRole);
	return `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${T.doc} ${esc(d.number)}</title><style>
@font-face{font-family:"Instrument Sans";font-weight:400 700;src:url("${url("@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2")}")}
@font-face{font-family:"IBM Plex Mono";font-weight:400;src:url("${url("@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2")}")}
@font-face{font-family:"IBM Plex Mono";font-weight:500;src:url("${url("@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")}")}
@font-face{font-family:"Poppins";font-weight:700;src:url("${url("@fontsource/poppins/files/poppins-latin-700-normal.woff2")}")}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Instrument Sans",sans-serif;font-size:9.5pt;line-height:1.5;color:#${C.ink900}}
.sheet{width:210mm;height:296.5mm;position:relative;overflow:hidden}
.bar{height:5mm;background:linear-gradient(90deg,#ff8b0d,#ff5310 50%,#ff781d)}
.page{padding:11mm 20mm 0}
.head{display:flex;justify-content:space-between;align-items:center}
.brand{display:flex;align-items:center;gap:4mm}
.brand img{width:17mm;height:17mm}
.brand .n{font-family:Poppins,sans-serif;font-weight:700;font-size:15pt;line-height:1.1}
.brand .t{font-family:"IBM Plex Mono",monospace;font-size:6.8pt;color:#${C.ink500};letter-spacing:.03em;text-transform:uppercase;margin-top:1mm}
h1{font-family:Poppins,sans-serif;font-weight:700;font-size:26pt;line-height:1;color:#${C.orange500};letter-spacing:.02em}
.meta{display:flex;justify-content:space-between;margin-top:7mm}
.meta div div b{display:inline-block;min-width:34mm;color:#${C.ink500};font-weight:500}
.meta .r{text-align:left}
.client{margin-top:5mm;line-height:1.55;width:50%}.client b{font-size:10.5pt}
.rule{height:3.2mm;background:#${C.orange500};margin-top:5mm}
.proj{display:grid;grid-template-columns:36mm 1fr;margin-top:4mm;column-gap:6mm}
.proj .k{font-weight:700}
table.items{width:100%;border-collapse:collapse;margin-top:5mm}
.items th{font-weight:700;text-align:left;padding:0 3mm 2.5mm;border-bottom:1px solid #${C.ink900}}
.items th.c,.items td.c{text-align:center}.items th.r,.items td.r{text-align:right}
.items th:first-child,.items td:first-child{padding-left:3mm}
.items td{padding:3.5mm 3mm 3.5mm;vertical-align:top;border-bottom:1px solid #${C.ink900}}
.items td.c,.items td.r{white-space:nowrap}
.link{margin-top:1.2mm;font-size:9pt;color:#${C.ink700}}.link a{color:#${C.orange600};text-decoration:underline}
.detail{margin-top:1.5mm;font-size:8.6pt;line-height:1.5;color:#${C.ink700}}
.mono{font-family:"IBM Plex Mono",monospace;font-size:9pt}
.sum{display:grid;grid-template-columns:1fr 80mm;gap:8mm;margin-top:4mm}
.say{font-size:8.6pt;color:#${C.ink500}}.say i{display:block;margin-top:.5mm;color:#${C.ink700}}
.pnote{margin-top:2.5mm;font-size:7.8pt;line-height:1.45}
.tot{width:100%;border-collapse:collapse}.tot td{padding:1mm 0}.tot td:first-child{font-weight:700;color:#${C.ink700}}.tot td:last-child{text-align:right}
.grand td{padding:0}.grand .box{background:#${C.orange500};color:#fff;padding:1.4mm 3mm;display:flex;justify-content:space-between;font-weight:700;margin-top:1mm}
.grand .box b{font-family:Poppins,sans-serif}
.incl{margin-top:2.5mm;border-top:1px solid #${C.ink200};padding-top:2mm;display:flex;justify-content:space-between;font-weight:700}
.incl span:last-child{font-family:Poppins,sans-serif;color:#${C.orange600}}
.sub{font-size:8pt;color:#${C.ink500};font-weight:400}
.rule2{height:1.6mm;background:#${C.ink900};margin-top:4mm}
.foot2{display:grid;grid-template-columns:1fr 1fr;gap:14mm;margin-top:3mm}
.k{font-style:italic;color:#${C.ink700};font-size:9pt}
dl{display:grid;grid-template-columns:auto 1fr;gap:1.2mm 6mm;margin-top:2mm;font-size:9pt}dt{color:#${C.ink500}}dd{font-weight:600}
.sign .who{font-weight:700;margin-top:1mm}.sign .sp{position:relative;height:17mm;border-bottom:1px solid #${C.ink900};margin-bottom:1mm}
.sign .role{font-style:italic;color:#${C.ink500};font-size:8.4pt}
ol{padding-left:4.5mm;margin-top:3.5mm;color:#${C.ink700};font-size:7.8pt;line-height:1.4}ol li{margin-bottom:.6mm}
.tk{margin-top:4mm;font-weight:700;font-size:9pt}
.foot{position:absolute;left:0;right:0;bottom:0}
.foot .in{display:flex;justify-content:space-between;padding:2.6mm 20mm;font-family:"IBM Plex Mono",monospace;font-size:7pt;color:#${C.ink500};border-top:1px solid #${C.ink100}}
</style></head><body><div class="sheet">
<div class="bar"></div><div class="page">
<div class="head"><div class="brand"><img src="${logo}" alt="OnTable"><div><div class="n">${esc(d.studio.name)}</div><div class="t">${esc(d.studio.tagline)}</div></div></div><h1>${T.title}</h1></div>
<div class="meta"><div><div><b>${T.noLbl}:</b>${esc(d.number)}</div><div><b>Proyek:</b>${esc(d.project)}</div></div><div class="r"><div><b style="min-width:26mm">Tanggal:</b>${d.date}</div><div><b style="min-width:26mm">Berlaku s.d.:</b>${d.valid}</div></div></div>
<div class="client"><div style="color:#${C.ink500};font-size:8.6pt">${T.to}</div><b>${esc(d.client.name)}</b><div>U.p. ${esc(d.client.attn)}</div><div>${esc(d.client.address)}</div><div>${esc(d.client.contact)}</div>${d.client.npwp ? `<div>NPWP: ${esc(d.client.npwp)}</div>` : ""}</div>
<div class="rule"></div>
<div class="proj"><div class="k">Deskripsi Proyek</div><div>${esc(d.projectDesc)}</div></div>
<table class="items"><thead><tr><th>Deskripsi</th><th class="c" style="width:22mm">Jumlah</th><th class="r" style="width:30mm">Harga</th><th class="r" style="width:30mm">Total</th></tr></thead><tbody>${rows}</tbody></table>
<div class="sum"><div class="say"><div>Terbilang</div><i>${terbilang}</i></div>
<div><table class="tot"><tr><td>Subtotal</td><td class="mono">${idr(subtotal)}</td></tr>${d.discount ? `<tr><td>Diskon</td><td class="mono">- ${idr(d.discount)}</td></tr>` : ""}${d.taxRate ? `<tr><td>PPN ${d.taxRate}%</td><td class="mono">${idr(tax)}</td></tr>` : ""}${d.pph ? `<tr><td>${esc(d.pph.label)}</td><td class="mono">${idr(pphAmount)}</td></tr>` : ""}</table>
<div class="grand"><div class="box"><span>${d.pph ? "Harga termasuk pajak" : T.total}</span><b>${idr(grossWithPph)}</b></div></div></div></div>
<div class="rule2"></div>
<div class="foot2"><div>${left}</div><div>${right}</div></div>
<ol>${clauses.map((c) => `<li>${esc(c)}</li>`).join("")}</ol>
</div>
<div class="foot"><div class="in"><span>${d.studio.email}</span></div><div class="bar" style="height:3mm"></div></div></div>
</body></html>`;
}

// ---------------------------------------------------------------- docx
const { Document, Packer, Paragraph, TextRun, ImageRun, ExternalHyperlink, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType, VerticalAlign, Footer, TabStopType, LevelFormat } = docx;
const F = { display: "Poppins", body: "Instrument Sans", mono: "IBM Plex Mono" };
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE };
const W = 9638; // content width: A4 11906 - 2*1134

const run = (text, o = {}) => new TextRun({ text, font: o.font ?? F.body, size: o.size ?? 19, bold: o.bold, italics: o.italics, color: o.color ?? C.ink900, characterSpacing: o.cs, allCaps: o.caps });
const para = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], alignment: o.align, spacing: { before: o.before ?? 0, after: o.after ?? 0, line: o.line ?? 300 }, border: o.border, keepNext: o.keepNext, indent: o.indent });
const cell = (children, width, o = {}) =>
	new TableCell({
		children: Array.isArray(children) ? children : [children],
		width: { size: width, type: WidthType.DXA },
		borders: o.borders ?? noBorders,
		shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: "auto" } : undefined,
		margins: o.margins ?? { top: 60, bottom: 60, left: 0, right: 0 },
		verticalAlign: o.v ?? VerticalAlign.TOP,
	});
const table = (cols, rows) => new Table({ width: { size: cols.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: cols, rows, borders: { ...noBorders, insideHorizontal: NONE, insideVertical: NONE } });
const solid = (size, color) => ({ style: BorderStyle.SINGLE, size, color });

async function buildDocx() {
	const d = data;
	const logo = fs.readFileSync(path.join(here, "logo.png"));
	const gap = (h) => para(run(""), { line: h });
	const rule = (size, color, before = 0, after = 0) => new Paragraph({ children: [], spacing: { before, after, line: 20 }, border: { bottom: solid(size, color) } });

	const header = table([760, 5000, 3878], [
		new TableRow({
			children: [
				cell(new Paragraph({ children: [new ImageRun({ type: "png", data: logo, transformation: { width: 50, height: 50 }, altText: { title: "OnTable", description: "OnTable logo", name: "logo" } })] }), 760, { margins: { top: 0, bottom: 0, left: 0, right: 100 }, v: VerticalAlign.CENTER }),
				cell([para(run(d.studio.name, { font: F.display, bold: true, size: 30 })), para(run(d.studio.tagline, { font: F.mono, size: 13, color: C.ink500, caps: true, cs: 10 }), { before: 20 })], 5000, { margins: { top: 0, bottom: 0, left: 80, right: 0 }, v: VerticalAlign.CENTER }),
				cell(para(run(T.title, { font: F.display, bold: true, size: 48, color: C.orange500 }), { align: AlignmentType.RIGHT }), 3878, { margins: { top: 0, bottom: 0, left: 0, right: 0 }, v: VerticalAlign.CENTER }),
			],
		}),
	]);

	const kv = (k, v, kw) => para([run(k, { color: C.ink500, bold: true }), new TextRun({ text: "\t" + v, font: F.body, size: 19 })], { after: 20 });
	const kvP = (k, v, pos) => new Paragraph({ tabStops: [{ type: TabStopType.LEFT, position: pos }], spacing: { after: 20, line: 300 }, children: [run(k, { color: C.ink500, bold: true }), new TextRun({ text: "\t" + v, font: F.body, size: 19 })] });
	const meta = table([5238, 4400], [
		new TableRow({ children: [
			cell([kvP(T.noLbl + ":", d.number, 1700), kvP("Proyek:", d.project, 1700)], 5238),
			cell([kvP("Tanggal:", d.date, 1500), kvP("Berlaku s.d.:", d.valid, 1500)], 4400),
		] }),
	]);

	const IND = { right: 4800 };
	const clientBlock = [
		para(run(T.to, { size: 17, color: C.ink500 }), { before: 200, indent: IND }),
		para(run(d.client.name, { bold: true, size: 21 }), { indent: IND }),
		para(run("U.p. " + d.client.attn), { indent: IND }),
		para(run(d.client.address), { indent: IND }),
		para(run(d.client.contact), { indent: IND }),
		...(d.client.npwp ? [para(run("NPWP: " + d.client.npwp), { indent: IND })] : []),
	];

	const bar = new Paragraph({ children: [], spacing: { before: 200, after: 140, line: 20 }, border: { bottom: solid(36, C.orange500) } });
	const proj = table([2040, 7598], [new TableRow({ children: [cell(para(run("Deskripsi Proyek", { bold: true })), 2040), cell(para(run(d.projectDesc)), 7598)] })]);

	const cols = [4938, 1400, 1650, 1650];
	const hb = { ...noBorders, bottom: solid(6, C.ink900) };
	const th = (t, w, al) => cell(para(run(t, { bold: true }), { align: al }), w, { borders: hb, margins: { top: 40, bottom: 100, left: 60, right: 60 } });
	const rb = { ...noBorders, bottom: solid(6, C.ink900) };
	const cm = { top: 120, bottom: 160, left: 60, right: 60 };
	const items = table(cols, [
		new TableRow({ tableHeader: true, children: [th("Deskripsi", cols[0]), th("Jumlah", cols[1], AlignmentType.CENTER), th("Harga", cols[2], AlignmentType.RIGHT), th("Total", cols[3], AlignmentType.RIGHT)] }),
		...d.items.map((i) => new TableRow({ cantSplit: true, children: [
			cell([
				para(run(i.desc, { bold: true })),
				...(i.link ? [para([run("Link game: ", { color: C.ink700, size: 18 }), new ExternalHyperlink({ link: i.link, children: [new TextRun({ text: i.link, font: F.body, size: 18, color: C.orange600, underline: {} })] })], { before: 40 })] : []),
				...(i.detail ? [para(run(i.detail, { size: 17, color: C.ink700 }), { before: 60, line: 280 })] : []),
			], cols[0], { borders: rb, margins: cm }),
			cell(para(run(`${i.qty} ${i.unit}`), { align: AlignmentType.CENTER }), cols[1], { borders: rb, margins: cm }),
			cell(para(run(idr(i.price), { font: F.mono, size: 18 }), { align: AlignmentType.RIGHT }), cols[2], { borders: rb, margins: cm }),
			cell(para(run(idr(i.qty * i.price), { font: F.mono, size: 18 }), { align: AlignmentType.RIGHT }), cols[3], { borders: rb, margins: cm }),
		] })),
	]);

	const trow = (k, v, fill) => new TableRow({ children: [cell(para(run(k, { bold: true, size: fill ? 17 : 19, color: fill ? "FFFFFF" : C.ink700 })), 2100, { fill, margins: { top: 70, bottom: 70, left: fill ? 120 : 0, right: 40 } }), cell(para(run(v, { font: fill ? F.display : F.mono, size: fill ? 19 : 18, bold: !!fill, color: fill ? "FFFFFF" : C.ink900 }), { align: AlignmentType.RIGHT }), 1500, { fill, margins: { top: 70, bottom: 70, left: 40, right: fill ? 120 : 0 } })] });
	const totalsRows = [trow("Subtotal", idr(subtotal)), ...(d.discount ? [trow("Diskon", "- " + idr(d.discount))] : []), ...(d.taxRate ? [trow(`PPN ${d.taxRate}%`, idr(tax))] : []), ...(d.pph ? [trow(d.pph.label, idr(pphAmount))] : []), trow(d.pph ? "Harga termasuk pajak" : T.total, idr(grossWithPph), C.orange500)];
	const taxRows = [];
	const right3600 = new Paragraph({ children: [] });
	const sums = table([6038, 3600], [
		new TableRow({ children: [
			cell([para(run("Terbilang", { size: 17, color: C.ink500 })), para(run(terbilang, { italics: true, color: C.ink700, size: 17 })), ], 6038, { margins: { top: 100, bottom: 0, left: 0, right: 300 } }),
			cell([table([2100, 1500], totalsRows), para(run(""), { line: 40 }), ...taxRows, para(run(""), { line: 20 })], 3600, { margins: { top: 60, bottom: 0, left: 0, right: 0 } }),
		] }),
	]);
	void right3600;

	const signBlock = (head, name, who, role, w) => cell([para(run(head, { italics: true, color: C.ink700, size: 17 })), para(run(name, { bold: true }), { before: 40 }), para(run(""), { line: 1100, border: { bottom: solid(6, C.ink900) } }), para(run(who, { bold: true }), { before: 60 }), ...(role ? [para(run(role, { italics: true, size: 16, color: C.ink500 }))] : [])], w, { margins: { top: 100, bottom: 0, left: 0, right: 200 } });
	const bk = (k, v, mono) => para([run(k, { color: C.ink500, size: 18 }), new TextRun({ text: "\t" + v, font: mono ? F.mono : F.body, size: 18, bold: !mono })], { after: 20 });
	const payCell = cell([para(run("Informasi pembayaran", { italics: true, color: C.ink700, size: 17 })), ...[["Bank", d.bank.name], ["Atas nama", d.bank.holder], ["No. rekening", d.bank.no, true], ["Konfirmasi", d.bank.confirm, true]].map(([k, v, m]) => new Paragraph({ tabStops: [{ type: TabStopType.LEFT, position: 1500 }], spacing: { after: 20, line: 290 }, children: [run(k, { color: C.ink500, size: 18 }), new TextRun({ text: "\t" + v, font: m ? F.mono : F.body, size: 18, bold: !m })] }))], 4819, { margins: { top: 100, bottom: 0, left: 0, right: 200 } });
	void bk;
	const foot2 = table([4819, 4819], [new TableRow({ children: Q
		? [signBlock("Hormat kami,", d.studio.name, d.signer, d.signerRole, 4819), signBlock("Mohon konfirmasi persetujuan penawaran ini:", d.client.name, d.approver, "", 4819)]
		: [payCell, signBlock("Hormat kami,", d.studio.name, d.signer, d.signerRole, 4819)] })]);

	const doc = new Document({
		creator: d.studio.name,
		title: `${T.doc} ${d.number}`,
		styles: { default: { document: { run: { font: F.body, size: 19, color: C.ink900 } } } },
		numbering: { config: [{ reference: "terms", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 340, hanging: 340 } }, run: { font: F.body, size: 15, color: C.ink700 } } }] }] },
		sections: [{
			properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 700, bottom: 900, left: 1134, right: 1134, footer: 350 } } },
			footers: { default: new Footer({ children: [new Paragraph({ border: { top: solid(4, C.ink100) }, tabStops: [{ type: TabStopType.CENTER, position: W / 2 }, { type: TabStopType.RIGHT, position: W }], children: [run(d.studio.email, { font: F.mono, size: 13, color: C.ink500 }), ] })] }) },
			children: [
				header, gap(240), meta, ...clientBlock, bar, proj, gap(160), items, sums, rule(14, C.ink900, 160, 120), foot2,
				new Paragraph({ children: [], spacing: { before: 120, after: 0, line: 20 } }),
				...clauses.map((c) => new Paragraph({ numbering: { reference: "terms", level: 0 }, spacing: { after: 20, line: 250 }, children: [run(c, { size: 15, color: C.ink700 })] })),
			],
		}],
	});
	return Packer.toBuffer(doc);
}

// ---------------------------------------------------------------- run
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, BASE + ".md"), buildMd());
fs.writeFileSync(path.join(outDir, BASE + ".docx"), await buildDocx());
const htmlPath = path.join(here, "invoice.html");
fs.writeFileSync(htmlPath, buildHtml());
const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(fs.existsSync);
execFileSync(chrome, ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${path.join(outDir, BASE + ".pdf")}`, pathToFileURL(htmlPath).href], { stdio: "ignore" });
fs.rmSync(htmlPath);
console.log("done", total, grossWithPph, pphAmount, terbilang);
