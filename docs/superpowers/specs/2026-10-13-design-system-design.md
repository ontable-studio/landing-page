# Design: OnTable Design System

Date: 2026-10-13
Status: Approved in conversation (spec pending review)

## Context

OnTable Studio is a small game-development team that builds products and projects. The
site is a portfolio: a Home page with one Hero section, a Projects page, and project
detail pages. This design system comes first, before any page.

References:

- **Coding Folks landing page** — the method: tokens in Tailwind v4 `@theme`, semantic
  aliases, a named type scale, `cva` + `cn()` primitives, inline utilities, no custom
  component classes in CSS.
- **utazon.fr** — the look and structure: framed project cards with a cut corner holding
  the year, title and category at the bottom, small uppercase metadata labels, minimal nav.
- **OnTable brand** — orange (about `#F5611F`) with the white isometric logo; tagline "We
  make games from our table. To your table."

## Decisions

| Aspect         | Decision                                                            |
| -------------- | ------------------------------------------------------------------- |
| Theme          | Light, orange brand (no dark mode in this pass)                     |
| Deliverable    | Tokens + primitives + a living style guide page at `/design-system` |
| Display font   | Blippo Black behind one `--font-display` token (see Risks)          |
| Body / UI font | Instrument Sans (variable), self-hosted via fontsource              |
| Label font     | IBM Plex Mono, small uppercase labels                               |
| Routing        | `react-router` with `/` (placeholder) and `/design-system`          |

## Tokens (`src/styles/main.css`)

`main.css` holds only `@theme`, `@layer base` and `@font-face`. No `@layer components`.

- **Colour:** orange scale 50–900 (`orange-500` is the brand); warm neutral `ink` scale
  50–900; semantic aliases `brand`, `brand-hover`, `canvas` (white), `surface`,
  `surface-border`, `text-primary`, `text-secondary`, `text-tertiary`. No blue.
- **Type:** `--font-display`, `--font-sans`, `--font-mono`. Named scale `display`, `h1`–`h4`,
  `title`, `body-lg`, `body`, `body-sm`, `label`, `caption`, each with line-height and
  weight. Display font is for hero and headings only. `cn()` is extended with these size
  names so `tailwind-merge` keeps colour and size classes apart.
- **Spacing and shape:** `--spacing-section` and `--spacing-section-lg`; use `rounded-2xl`
  and `rounded-3xl`; a `clip-path` utility for the cut corner.
- **Motion:** `rise` and `fade-in` entrances, a hover lift, all disabled under
  `prefers-reduced-motion`.

## Primitives

Each is a folder with the component, `index.ts` and a test, using `cva` + `cn()`.

| Component       | Location  | Variants / props                                                                                 |
| --------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `Button`        | `ui/`     | `variant`: primary, outline, ghost, link; `size`: sm, md, lg; `arrow`; renders `<a>` with `href` |
| `Badge`         | `ui/`     | `variant`: brand, neutral, outline; mono uppercase                                               |
| `Card`          | `ui/`     | `variant`: flat, bordered, elevated                                                              |
| `Container`     | `ui/`     | `size`: default, narrow                                                                          |
| `ProjectCard`   | `ui/`     | `title`, `category`, `year`, `image`, `href`; cut corner with year, hover zoom                   |
| `SectionHeader` | `layout/` | `eyebrow`, `title`, `description`                                                                |
| `Nav`           | `layout/` | Logo and links (Projects, Contact); sticky; collapses on mobile                                  |
| `Footer`        | `layout/` | Studio name, tagline, social links                                                               |

Project data (slugs, content) is not part of the design system; it arrives with the
Projects pages.

## Style guide page (`/design-system`)

One page, not linked from the public nav. A sticky mini-nav jumps between sections:
Colours (swatch, token name, hex), Typography (each step in the real fonts), Spacing and
radius, Motion (replayable), Components (all variants side by side).

## Routing and serving

`react-router` with `/` and `/design-system`. The nginx `location /` currently answers
unknown paths with 404; for client-side routes it must fall back to `index.html`, and the
app renders its own not-found view. `public/404.html` is kept for assets.

## Testing

- A unit test per primitive (renders, variants apply the expected classes, `Button` renders
  `<a>` with `href`).
- `cn()` test for the custom text tokens.
- A smoke test that `/design-system` renders its sections.
- `npm run lint`, `type-check`, `test` and `build` stay green; CI unchanged.

## Out of scope

Dark mode, the real Hero, Projects and project detail pages, project data, i18n, SEO.

## Risks

- **Blippo Black licence:** the `.resources` readme says only that it came from
  fontsgeek.com; no licence is stated and Blippo is originally a commercial typeface. It is
  used only through `--font-display`, so a free lookalike (for example Chango or Titan One)
  can replace it by changing that token and the font file. Confirm before launch.
- The `.resources` folder is git-ignored, so the font file must be copied into
  `public/fonts/` (or `src/assets/`) to ship; do this only once the licence is settled.

## Execution constraints (from the user)

When implementing: use only the Sonnet 5.5 model (`claude-sonnet-5-5`), and a single agent
in this terminal. No subagents, no parallel agents, no model switching.
