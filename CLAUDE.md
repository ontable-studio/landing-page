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

- `src/components/ui/` — primitives (Button, Badge, Card, Container, ProjectCard, Tabs), `cva` + `cn()`, router-free
- `src/components/layout/` — SectionHeader, Nav, Footer (both have `variant="overlay"` for Home, where they sit inside the one full-screen section; every other route gets the bar versions from `SiteLayout` in `App.tsx`)
- `src/pages/` — routes: `/` (one full-screen section: nav, hero and footer together), `/projects`, `/projects/:slug`, `/design-system` (living style guide: update it when adding a token or component)
- `src/data/projects.ts` — the one place project content lives; the four showcase games (Craftboard Heroes, Ketik Mancing, Laundry Kita, OxShiftGen), with pictures in `public/images/projects/<slug>/NN-name.webp`. `year` is optional (a project in development shows a `status` pill instead); credits (Date, Role, Platform, Made for) are added only when confirmed by the team; `links` renders external buttons such as "Play on itch.io" on the detail page. Each project has a `type` (Game, Tool, UI Design) that becomes a tab on `/projects` (filter kept in `?type=`) and a `category` shown on its card. Add a new type to `PROJECT_TYPES`
- `Container` sizes: `default` (6xl), `narrow`, `wide` (7xl, tighter gutters; used by the nav, footer and every page except Home). The nav bar is not sticky: it scrolls away with the page
- `RouterLink` (`layout/`) + `ProjectCard` `linkAs` give client-side card links while `ui/` stays router-free
- `src/common/constants.ts` — `SITE` (placeholders marked TODO(user))
- Each component: its own folder with `Name.tsx`, `index.ts`, `Name.test.tsx`

## Motion and interaction

- **Home background:** `DotGrid interactive` plus `usePointerGlow` (`src/lib`). The hook eases the pointer into CSS variables (`--gx`, `--gy`, `--nx`, `--ny`, `--glow-on`) on its element, so React never re-renders on a pointer move; children style themselves from the variables (the glow, the disc parallax, the card "View" chip). Other pages get a still, fainter `DotGrid`.
- **Hover is always paired with focus:** every hover effect also has a `focus-visible:` twin (`underlineLink` in `ui/linkStyles.ts`, the Button fill, the ProjectCard lift). Tailwind's `hover:` only applies on devices that can hover.
- **Projects filter:** runs inside `document.startViewTransition` when the browser has it and the page is visible (cards carry `view-transition-name` = slug); otherwise it just filters. The page root is kept still in CSS.
- **Reduced motion is ignored on purpose** (product decision): effects always run. To honor the OS setting everywhere, add `data-respect-reduced-motion` to `<html>` in `index.html`; both the CSS and `canTrack()` read that one attribute.
- No `backdrop-filter`, no filter blurs and no animated gradients: they were a suspect for load-time flashes.

## Working rules

- Implementation runs inline in one terminal session with Sonnet 5.5: no subagents.
- Specs and plans live in `docs/superpowers/`.

## Environment & Node

- `.nvmrc` = 22. `engines`: `>=20.19.0 <25`.
- `.env` must not be read or committed; template in `.env.example`.
- LF line endings everywhere (`.gitattributes`). Tab indent (yaml and `package-lock.json` use 2 spaces, via `.editorconfig`).
