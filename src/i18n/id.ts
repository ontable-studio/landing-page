import type { en } from "./en";

/** The Indonesian texts. Every key of `en` must be here, or type-check fails. */
export const id: Record<keyof typeof en, string> = {
	"nav.homeLabel": "Studio, beranda",
	"nav.projects": "Proyek",
	"nav.contact": "Kontak",
	"nav.menu": "Menu",
	"nav.language": "Bahasa",
	"nav.languageEnglish": "English",
	"nav.languageIndonesian": "Bahasa Indonesia",

	"home.line1": "Kami membuat game",
	"home.line2": "dari meja kami,",
	"home.line3": "untuk meja Anda.",
	"home.description": "Tim kecil yang membuat game, produk, dan proyek.",
	"home.viewProjects": "Lihat proyek",
	"home.contact": "Kontak",

	"projects.title": "Proyek",
	"projects.tabs": "Jenis proyek",
	"projects.all": "Semua",
	"projects.empty": "Belum ada proyek.",
	"type.game": "Game",
	"type.tool": "Alat",
	"type.ui-design": "Desain UI",
	"card.view": "Lihat",

	"project.back": "Kembali",
	"project.next": "Proyek berikutnya",
	"project.viewLarger": "Perbesar: {alt}",
	"credit.date": "Tanggal",
	"credit.role": "Peran",
	"credit.platform": "Platform",
	"credit.madeFor": "Dibuat untuk",
	"credit.status": "Status",
	"status.inDevelopment": "Sedang dikembangkan",

	"lightbox.label": "Pratinjau gambar",
	"lightbox.close": "Tutup pratinjau",
	"lightbox.previous": "Gambar sebelumnya",
	"lightbox.next": "Gambar berikutnya",

	"contact.dialogLabel": "Kontak",
	"contact.title": "Ceritakan proyek Anda",
	"contact.writeTo": "Atau tulis ke",
	"contact.copy": "Salin email",
	"contact.copied": "Tersalin",
	"contact.close": "Tutup kontak",
	"contact.name": "Nama",
	"contact.email": "Email",
	"contact.message": "Pesan",
	"contact.send": "Kirim",
	"contact.sent":
		"Aplikasi email Anda akan terbuka dengan pesan siap kirim. Jika tidak terjadi apa-apa, tulis ke {email}.",
	"contact.error.name": "Masukkan nama Anda",
	"contact.error.emailMissing": "Masukkan alamat email Anda",
	"contact.error.emailInvalid": "Masukkan alamat email yang valid",
	"contact.error.message": "Tulis pesan",
	"contact.mailSubject": "Pesan dari {name}",

	"notFound.title": "Halaman tidak ditemukan",
	"notFound.back": "Kembali ke beranda",

	"seo.list.and": "dan",
	"seo.home.title": "OnTable Studio: tim kecil pengembang game",
	"seo.home.description":
		"OnTable Studio adalah tim kecil yang membuat game, produk, dan proyek. Lihat {games}.",
	"seo.projects.title": "Proyek — OnTable Studio",
	"seo.projects.description": "Game dan proyek dari OnTable Studio: {games}.",
	"seo.project.title": "{title} — OnTable Studio",
	"seo.designSystem.title": "Design System — OnTable Studio",
	"seo.designSystem.description":
		"Colours, type, spacing and components used on the OnTable Studio site.",
	"seo.notFound.title": "Halaman tidak ditemukan — OnTable Studio",
	"seo.notFound.description":
		"Halaman ini tidak ada. Kembali ke beranda OnTable Studio atau lihat proyek-proyeknya.",
	"seo.imageAlt.home": "OnTable Studio: {tagline}",
	"seo.imageAlt.projects": "Proyek OnTable Studio",
	"seo.imageAlt.project": "Sampul {title}",
	"seo.noscript.home": "Beranda",
	"seo.noscript.projects": "Proyek",
};
