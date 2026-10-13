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

- `src/styles/main.css` holds only `@theme` tokens, `@font-face`, the base layer and the `cut-corner` utility. No `@layer components`.
- Use inline Tailwind utilities in TSX, not custom CSS classes.
- Write classes as-is; `npm run lint:fix` + `npm run format` (pre-commit) canonicalize and sort them.
- Tokens: orange (brand) and ink (warm neutral) scales plus semantic aliases (`brand`, `surface`, `text-*`). No blue. Light theme only.
- `font-display` (Poppins Bold, via the one `--font-display` token) is for the hero and headings only; body is Instrument Sans, small labels IBM Plex Mono.
- Type uses the named scale (`text-display`, `text-h1`…`text-caption`). New text sizes must also be added to `TEXT_SIZE_TOKENS` in `src/lib/cn.ts`.
- White on `orange-500` is about 3.3:1: keep labels on it semibold and 16px or larger.
- Radius: `rounded-2xl`, `rounded-3xl`, `rounded-full`.

## Structure

- `src/components/ui/` — primitives (Button, Badge, Card, Container, ProjectCard), `cva` + `cn()`, router-free
- `src/components/layout/` — SectionHeader, Nav, Footer
- `src/pages/` — routes (`/`, `/design-system`); `/design-system` is the living style guide, update it when adding a token or component
- `src/common/constants.ts` — `SITE` (placeholders marked TODO(user))
- Each component: its own folder with `Name.tsx`, `index.ts`, `Name.test.tsx`

## Working rules

- Implementation runs inline in one terminal session with Sonnet 5.5: no subagents.
- Specs and plans live in `docs/superpowers/`.

## Environment & Node

- `.nvmrc` = 22. `engines`: `>=20.19.0 <25`.
- `.env` must not be read or committed; template in `.env.example`.
- LF line endings everywhere (`.gitattributes`). Tab indent (yaml and `package-lock.json` use 2 spaces, via `.editorconfig`).
