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

- `src/components/ui/` — primitives (Button, Badge, Card, Container, ProjectCard, Tabs, Modal, Lightbox, SocialChips, DotGrid), `cva` + `cn()`, router-free
- `src/components/layout/` — SectionHeader, Nav, Footer (both have `variant="overlay"` for Home, where they sit inside the one full-screen section; every other route gets the bar versions from `SiteLayout` in `App.tsx`)
- `src/pages/` — routes: `/` (one full-screen section: nav, hero and footer together), `/projects`, `/projects/:slug`, `/design-system` (living style guide: update it when adding a token or component)
- `src/data/projects.ts` — the one place project content lives; the four showcase games (Craftboard Heroes, Ketik Mancing, Laundry Kita, OxShiftGen), with pictures in `public/images/projects/<slug>/NN-name.webp`. `year` is optional (a project in development shows a `status` pill instead); credits (Date, Role, Platform, Made for) are added only when confirmed by the team; `links` renders external buttons such as "Play on itch.io" on the detail page. Each project has a `type` (Game, Tool, UI Design) that becomes a tab on `/projects` (filter kept in `?type=`) and a `category` shown on its card. Add a new type to `PROJECT_TYPES`
- `Container` sizes: `default` (6xl), `narrow`, `wide` (7xl, tighter gutters; used by the nav, footer and every page except Home). The nav bar is not sticky: it scrolls away with the page
- `RouterLink` (`layout/`) + `ProjectCard` `linkAs` give client-side card links while `ui/` stays router-free
- `src/common/constants.ts` — `SITE`: name, tagline, the studio email (`ontablestudio@gmail.com`) and the social links (Instagram, itch.io), which feed the footer chips, the contact dialog and the Organization JSON-LD
- Each component: its own folder with `Name.tsx`, `index.ts`, `Name.test.tsx`
- `src/i18n/` — English (default, no prefix) and Indonesian (`/id/...`). The language comes from the URL only: nothing stored, no redirect. `en.ts` is the source of every text key; `id.ts` is typed `Record<keyof typeof en, string>`, so a missing key fails type-check. Use `useT()` → `{ locale, t, to }` (`to("/projects")` keeps links in the language); `{name}` placeholders. The design system is English only. Project texts: English in `data/projects.ts`, Indonesian in `data/projects.id.ts`, merged by `localizeProject`. A new project needs an entry in both. The SEO build writes `id/...` pages, `hreflang` and a sitemap with alternates. A new route goes in `App.tsx` for both prefixes and in `emittedPages()`

## Contact

- "Contact" in the nav (desktop and mobile menu) and the Home hero is a button, not a link: it opens the one `ContactDialog` held by `ContactProvider` (wrapped around the routes in `App`; `useContact().open()`). Outside a provider `open` does nothing, so components still render alone in tests.
- The dialog is a `Modal` (the same one `Lightbox` uses): name, email and message, the studio email with a copy button, the social chips bottom-left and Send bottom-right. Validation and the `mailto:` text live in `layout/Contact/mailto.ts`.
- **Send opens the visitor's email app** with the message ready (`mailto:`), because the site has no server. To send from the site instead, pass a different `onSend` (a form service or a Vercel function); the rest of the dialog stays as is.
- The footer (both variants) ends with the same `SocialChips`, which open in a new tab.

## Motion and interaction

- **Home background:** `DotGrid interactive` plus `usePointerGlow` (`src/lib`). The hook eases the pointer into CSS variables (`--gx`, `--gy`, `--nx`, `--ny`, `--glow-on`) on its element, so React never re-renders on a pointer move; children style themselves from the variables (the glow, the disc parallax, the card "View" chip). Other pages get a still, fainter `DotGrid`.
- **Hover is always paired with focus:** every hover effect also has a `focus-visible:` twin (`underlineLink` in `ui/linkStyles.ts`, the Button fill, the ProjectCard lift). Tailwind's `hover:` only applies on devices that can hover.
- **Projects filter:** runs inside `document.startViewTransition` when the browser has it and the page is visible (cards carry `view-transition-name` = slug); otherwise it just filters. The page root is kept still in CSS.
- **Reduced motion is ignored on purpose** (product decision): effects always run. To honor the OS setting everywhere, add `data-respect-reduced-motion` to `<html>` in `index.html`; both the CSS and `canTrack()` read that one attribute.
- **Project detail:** gallery pictures are buttons that open `Lightbox` (portal, Esc/arrows/Tab trap, scroll lock, focus returns to the thumbnail). Open and close zoom through a view transition: the clicked thumbnail and the lightbox picture share the name `preview` (only one element may hold it at a time, see `named` in `ProjectDetail.tsx`). The hero title rises out of a mask, the cover settles in (`animate-settle`) and drifts with the pointer, and a "Next project" card (`nextProject()` in the data) loops through the list.
- **Pictures can't be dragged, selected or long-pressed, anywhere:** the base layer in `main.css` sets `user-drag`/`user-select` to none for `img`, `svg`, `video`, `canvas` and friends, and `preventMediaDrag()` (installed once in `App`) cancels `dragstart` for media and for any link or button that wraps media (a project card), which also covers Firefox. Text links and selected text stay draggable. New pictures need nothing extra.
- No `backdrop-filter`, no filter blurs and no animated gradients: they were a suspect for load-time flashes.

## SEO

- **One place decides a page's meta:** `src/seo/pages.ts` (`pageMeta(route)`: title, description, robots, preview image). Add a page there first; the build and the client both read it. Titles end in "— OnTable Studio"; descriptions stay between 50 and 160 characters.
- **The build writes each page's head into its own HTML** (Vite plugin `seo` in `vite.config.ts`, helpers in `src/seo/render.ts`): `index.html` for Home and `projects/index.html`, `projects/<slug>/index.html`, `design-system/index.html`, plus `robots.txt` and `sitemap.xml`. The root `index.html` carries the `seo:head` and `seo:noscript` markers the plugin fills; keep them, and keep any title, description or icon inside them.
- **`useSeo(route)`** (every page calls it) keeps the head right on client-side navigation. A project page passes the project object.
- **Adding a project** needs: its entry in `src/data/projects.ts` and `public/og/<slug>.jpg` (run `python -I scripts/make-og-images.py .`, needs Pillow). Tests fail without the image. The sitemap, the page file and the structured data follow from the data.
- **Site address:** `VITE_SITE_URL`, else Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, else `https://landing-page-ontable.vercel.app`. Canonicals, Open Graph URLs and the sitemap use it.
- **Unknown paths are a real 404** (`public/404.html`, `noindex`); `vercel.json` has no rewrite on purpose. `/design-system` is `noindex` and not in the sitemap.
- **Indexing needs Vercel Deployment Protection off** for the production domain (Settings → Deployment Protection); while it is on, crawlers are redirected to a login.

## Working rules

- Implementation runs inline in one terminal session with Sonnet 5.5: no subagents.
- Specs and plans live in `docs/superpowers/`.

## Environment & Node

- `.nvmrc` = 22. `engines`: `>=20.19.0 <25`.
- `.env` must not be read or committed; template in `.env.example`.
- LF line endings everywhere (`.gitattributes`). Tab indent (yaml and `package-lock.json` use 2 spaces, via `.editorconfig`).
