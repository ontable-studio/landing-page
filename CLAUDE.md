# CLAUDE.md — OnTable Landing Page Conventions

OnTable Studio landing page — Vite · React 19 · TypeScript · Tailwind CSS v4. Docker-ready.

## Commands

| Command                     | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| `npm run dev`               | Vite dev server (port 5173)                       |
| `npm test`                  | Vitest (`vitest run src/ --maxWorkers=2`)         |
| `npm run type-check`        | `tsc --noEmit`                                    |
| `npm run lint` / `lint:fix` | ESLint flat config (unicorn + better-tailwindcss) |
| `npm run format`            | Prettier (Tailwind class order via plugin)        |
| `npm run build`             | `tsc && vite build`                               |

Husky pre-commit: lint-staged (eslint + prettier auto-fix) → type-check → test. Commitlint enforces Conventional Commits.

## Styling

- `src/styles/main.css` holds only `@theme` tokens and the base layer. No `@layer components`.
- Use inline Tailwind utilities in TSX, not custom CSS classes.
- Write classes as-is; `npm run lint:fix` + `npm run format` (pre-commit) canonicalize and sort them.
- The design system tokens will be added to `@theme`.

## Environment & Node

- `.nvmrc` = 22. `engines`: `>=20.19.0 <25`.
- `.env` must not be read or committed; template in `.env.example`.
- LF line endings everywhere (`.gitattributes`). Tab indent (yaml and `package-lock.json` use 2 spaces, via `.editorconfig`).
