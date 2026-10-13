/**
 * lint-staged — dijalankan otomatis oleh husky pre-commit.
 * Hanya memproses file yang di-stage, lalu hasil auto-fix ikut ter-commit.
 *
 * Urutan penting: `eslint --fix` dulu (canonical/shorthand utilities),
 * baru `prettier --write` (merapikan + mengurutkan kelas Tailwind),
 * supaya urutan kelas final sudah benar.
 */
export default {
	"*.{ts,tsx}": ["eslint --fix", "prettier --write"],
	// package-lock.json dikecualikan (dikelola npm) — lihat .prettierignore
	"*.{json,md,css,html}": ["prettier --write"],
};
