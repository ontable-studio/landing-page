# Design: SEO for every page

Date: 2026-10-14
Status: Proposed in conversation (spec pending review)

## Context

The site is a client-rendered React app deployed to Vercel. Findings on the live deployment:

- Only `/` can be opened directly. `/projects`, `/projects/<slug>`, `robots.txt` and
  `sitemap.xml` return 404 (no SPA rule on Vercel), so deep links, refreshes and crawlers fail.
- `landing-page-ontable.vercel.app` is behind Vercel Deployment Protection: every request is
  redirected to a Vercel login with `X-Robots-Tag: noindex`. Nothing can be indexed until the
  team turns off Vercel Authentication in the Vercel dashboard (Settings → Deployment
  Protection). This is not something the code can change.
- Every page ships `<title>OnTable</title>` and `description="OnTable Studio"` in its HTML.
  Real titles only appear after JavaScript runs, so social previews and crawlers without JS
  see the generic head. There is no canonical, Open Graph, Twitter card, JSON-LD, robots,
  sitemap or preview image.

## Decisions

| Aspect             | Decision                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical site URL | `https://landing-page-ontable.vercel.app`, overridable by `VITE_SITE_URL`; on Vercel `VERCEL_PROJECT_PRODUCTION_URL` is the second choice |
| Rendering          | Build writes one static `index.html` per page with its own head (no server, no SSR)                                                       |
| Source of truth    | One pure module builds each page's meta; the build plugin and the client hook both use it                                                 |
| Unknown paths      | A real 404 (`public/404.html`, `noindex`), not the app shell with status 200                                                              |
| Out of scope       | Custom domain, i18n and hreflang, analytics, blog, team structured data                                                                   |

## Pages and their meta

`src/seo/pages.ts` exports `pageMeta(route)`; a route is `home`, `projects`, `project(slug)`,
`design-system` or `not-found`.

| Page               | Title                                           | Description                                                   | Robots              |
| ------------------ | ----------------------------------------------- | ------------------------------------------------------------- | ------------------- |
| `/`                | `OnTable Studio: a small game development team` | One sentence about the studio plus the four game names        | index               |
| `/projects`        | `Projects — OnTable Studio`                     | Names the projects in the data                                | index               |
| `/projects/<slug>` | `<Title> — OnTable Studio`                      | The project summary, cut at a word boundary to 155 characters | index               |
| `/design-system`   | `Design System — OnTable Studio`                | Fixed sentence                                                | `noindex, nofollow` |
| not found          | `Page not found — OnTable Studio`               | Fixed sentence                                                | `noindex`           |

Every page also gets `canonical` (the page's own absolute URL), `og:type`
(`website`; `article` is not used), `og:site_name`, `og:title`, `og:description`, `og:url`,
`og:image` (+ width, height, alt), `og:locale` `en_US`, `twitter:card` `summary_large_image`
with title, description and image, `theme-color`, the icons (`favicon.svg`, `favicon.ico`,
`apple-touch-icon.png`) and the web manifest.

## Structured data (JSON-LD)

Only facts the data holds.

- Home: `Organization` (name, url, logo) and `WebSite` (name, url).
- Projects: `CollectionPage` with an `ItemList` of the projects (position, url, name).
- Project detail: `VideoGame` (name, description, image, url, genre, `gamePlatform` from the
  Platform credit, `datePublished` from the year when there is one, `author` the Organization,
  `sameAs` the itch.io link when there is one) and a `BreadcrumbList` (Home, Projects, the project).
- Output is escaped so a `<` in data cannot close the script tag.

## Build output (`src/seo` + a Vite plugin in `vite.config.ts`)

- `index.html` gets two markers: `<!-- seo:head -->…<!-- /seo:head -->` in the head and
  `<!-- seo:noscript -->…<!-- /seo:noscript -->` in the body.
- After the bundle is built the plugin fills the markers for `/` and emits
  `projects/index.html`, `projects/<slug>/index.html` and `design-system/index.html`
  (same scripts and styles, different head and `<noscript>`).
- `<noscript>` holds the page's `h1`, summary and links to Home and Projects, so a crawler
  without JavaScript has content and internal links.
- Also emitted: `robots.txt` (allow all, disallow `/design-system`, `Sitemap:` line) and
  `sitemap.xml` (Home, Projects and every project; `lastmod` is the build date; design system and
  404 are left out).
- In dev the same head is injected for `/` only; other routes are handled by the client hook.

## Client hook

`useSeo(meta)` replaces `useDocumentTitle` on every page. In an effect it updates the title,
`description`, `robots`, `canonical`, `og:*`, `twitter:*` and swaps the JSON-LD script, creating
tags when missing, so a client-side navigation leaves a correct head (Google runs JavaScript).
`useDocumentTitle` stays as an internal helper of the hook.

## Preview images

`public/og/default.jpg` and `public/og/<slug>.jpg`, 1200×630 JPG. The project images are the
covers cropped from 960×540 (scaled up 1.25×), so they are a little soft; the default is the white
OnTable wordmark on the brand orange. Generated by `scripts/make-og-images.py` (Pillow, run by hand,
not part of the build) and committed.

## Other changes

- `ProjectCard` gets a `headingLevel` prop (default 3); the Projects page uses 2, so headings go
  h1, h2 and not h1, h3.
- `vercel.json`: long immutable cache for `/assets/*` and `/images/*`, no rewrites.
- `public/site.webmanifest`: `name`, `short_name` and `description` use "OnTable Studio".
- `.env.example` documents `VITE_SITE_URL`.
- Titles move from "… — OnTable" to "… — OnTable Studio" in the existing tests and pages.

## Testing

- Pure: `pageMeta` for each route (titles, descriptions within limits, robots, canonical),
  description cutting, site-URL resolution, JSON-LD shapes and escaping, sitemap and robots text.
- Render: filling the markers (head replaced, no duplicate title or description, noscript present),
  and the list of files the build emits for the project data.
- Hook: updates title, description, canonical, robots, `og:*` and JSON-LD on mount and on change.
- Real output: after `npm run build`, read `dist/` and check each page's head, `robots.txt`,
  `sitemap.xml` and that every project has a file.
- `lint`, `type-check`, `test` and `build` stay green; CI unchanged.

## Risks

- Vercel serving `/projects` and `/projects/<slug>` from `projects/index.html` style files is
  expected (directory index) but can only be confirmed on a deployment whose protection is off;
  the fallback is emitting `projects.html` with `cleanUrls: true`.
- Until Deployment Protection is switched off, no crawler can reach the site and social
  previews will not render.
- Preview images from low-resolution covers look soft.
- Scrapers cache previews; after deploying, the Facebook, LinkedIn and X debuggers may need a refresh.

## Execution constraints (from the user)

Use only Sonnet 5.5 and a single agent in this terminal, executed inline. No subagents.
