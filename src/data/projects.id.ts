/**
 * Indonesian texts for each project in `projects.ts`, keyed by slug. A draft written
 * from the showcase images: the team should read it over. Names, platforms, roles and
 * "Game jam" are left as they are.
 */
export interface ProjectText {
	summary: string;
	/** Genre shown on the card. */
	category: string;
	/** One per picture in the project's gallery, in the same order. */
	galleryAlts: string[];
}

export const projectTextsId: Record<string, ProjectText> = {
	"craftboard-heroes": {
		summary:
			"Game aksi tentang mengubah imajinasi seorang anak menjadi kekuatan nyata. Lawan gelombang monster taman bermain di dunia yang terbuat dari kardus, lalu aktifkan Quick Draw: waktu melambat saat Anda menjiplak sketsa senjata, dan senjata yang Anda gambar pun terwujud.",
		category: "Aksi",
		galleryAlts: [
			"Menu utama Craftboard Heroes, dengan sang pahlawan berdiri di taman bermain",
			"Melawan monster taman bermain di arena pasir berpagar",
			"Kanvas Quick Draw terbuka di atas medan pertempuran saat melawan bos",
			"Tentang game: mengubah imajinasi liar seorang anak menjadi kekuatan nyata",
			"Quick Draw dalam empat langkah: tekan tombol, jiplak sketsa, waktu melambat, senjata muncul",
		],
	},
	"ketik-mancing": {
		summary:
			"Game memancing kasual yang dimainkan dengan keyboard, berbahasa Indonesia. Ketik kata yang muncul untuk menangkap ikan, kumpulkan umpan dengan mengetik kata pada cacing sebelum waktu habis, dan isi jurnal ikan dengan habitat, panjang, kelangkaan, dan berat tiap tangkapan di berbagai tempat memancing.",
		category: "Mengetik",
		galleryAlts: [
			"Menu utama Ketik Mancing, dengan seorang nelayan di perahunya",
			"Tempat memancing di jembatan desa, lengkap dengan penghitung waktu, umpan, dan tangkapan",
			"Mengetik kata pada cacing untuk mengumpulkan umpan",
			"Mengetik kalimat untuk menarik ikan",
			"Ikan tangkapan dengan bintang kelangkaannya",
			"Jurnal ikan terbuka pada dua spesies, dengan habitat, panjang, dan berat",
			"Memilih lokasi memancing berikutnya",
		],
	},
	"laundry-kita": {
		summary:
			"Simulasi manajemen tentang menjalankan usaha laundry di kota kecil isometrik. Pantau uang, hari, dan jam, belanja perlengkapan, serta atur mesin dan perabot di dalam toko.",
		category: "Simulasi",
		galleryAlts: [
			"Bagian dalam toko laundry, lengkap dengan mesin, rak, dan meja kasir",
			"Blok kota di sekitar toko",
			"Tampilan atas tata letak toko, dengan tombol belanja, barang, dan simpan",
		],
	},
	oxshiftgen: {
		summary:
			"Game dua pemain yang berlatar fasilitas industri. Tiap pemain memakai masker gas dengan meteran oksigennya sendiri, dan bersama-sama kalian membawa tabung oksigen, menggerakkan tuas, dan menyeberangi platform.",
		category: "Co-op",
		galleryAlts: [
			"Dua pemain dengan tabung oksigen di atas platform, masing-masing dengan meteran oksigen di layar",
			"Ruang platform dengan pijakan dan tuas",
			"Seorang pemain menyusuri tepian",
		],
	},
};
