# Design: OnTable Landing Pages (Home, Projects, Project detail)

Date: 2026-10-13
Status: Approved in conversation (spec pending review)

## Context

The design system is on `main` (tokens, `Button`, `Badge`, `Card`, `Container`, `ProjectCard`,
`SectionHeader`, `Nav`, `Footer`, `/design-system`). This spec builds the site itself.
Scope from the user: a Home page with one Hero section only, a Projects page, and project
detail pages. Reference for structure: utazon.fr (hero, stacked project cards, detail page
with credits and gallery). Look and feel come from our light, orange design system.

## Decisions

| Aspect       | Decision                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| Content      | Placeholder projects (clearly fake), swapped later; one data file          |
| Hero media   | No video or 3D: light canvas, soft orange glow, the OnTable isometric mark |
| Navigation   | Client-side with `react-router`; `ProjectCard` stays router-free           |
| Out of scope | Real content, video/3D backgrounds, ENTER splash, About page, i18n, SEO    |

## Data (`src/data/projects.ts`)

```ts
interface Project {
	slug: string;
	title: string;
	category: string;
	year: number;
	summary: string;
	image?: string;
	credits: { label: string; value: string }[];
	gallery: { src?: string; alt: string }[];
}
```

Four placeholder projects (for example "Placeholder Game One"). `projects: Project[]` and
`getProject(slug: string): Project | undefined`. Slugs are unique, kebab-case, and every
project has a non-empty summary (pinned by a test).

## Routes

| Path              | Page                                                    |
| ----------------- | ------------------------------------------------------- |
| `/`               | `Home`: the Hero                                        |
| `/projects`       | `Projects`: `SectionHeader` plus stacked `ProjectCard`s |
| `/projects/:slug` | `ProjectDetail`; an unknown slug renders `NotFound`     |
| `*`               | `NotFound`                                              |

`ProjectCard` gains an optional `linkAs?: React.ElementType` (default `"a"`). Pages pass a
small `RouterLink` (`({ href, ...props }) => <Link to={href} {...props} />`) so card clicks do not
reload the page. Each page sets `document.title` (`OnTable` on Home; `Projects — OnTable`;
`<Title> — OnTable`; `Page not found — OnTable`) through a `useDocumentTitle(title)` hook in
`src/lib/`.

## Home: one Hero section

Full height below the nav (`min-h-[calc(100svh-4rem)]`), light canvas, a soft orange radial
glow, and the OnTable mark (`/images/ontable-logo.svg`) as a large decorative element
(`aria-hidden`, empty `alt`). Headline is the tagline from `SITE.tagline` in `font-display`
at `text-display` (`text-h1` on mobile), one `body-lg` line below it, and two buttons:
"View projects" (primary, to `/projects`) and "Contact" (outline, `mailto:${SITE.email}`).
Entrances use `animate-rise`. Only the Hero is on the page.

## Projects page

`SectionHeader` (`as="h1"`, title "Projects", eyebrow "Our work"), then the projects stacked
in one column of full-width `ProjectCard`s, each linking to `/projects/<slug>`.

## Project detail page

A back `Button` (`variant="outline"`, link to `/projects`, label "Back"), a hero image area
(the project's `image`, or a gradient when absent), the title as the `h1` in `font-display`,
the category `Badge`, the summary, a credits list (`dl`: label and value), and a gallery
grid (one `img` per item with `alt`, or a gradient placeholder with `aria-hidden` when
`src` is absent).

## Testing

- Data: unique slugs; every project has summary; `getProject` hit and miss.
- `useDocumentTitle` sets the title.
- Home: tagline heading, both buttons with the right targets, decorative mark hidden from assistive tech.
- Projects: one link per project to `/projects/<slug>`; heading present.
- ProjectDetail: title, summary, every credit, back link; unknown slug shows the not-found view;
  gallery item without `src` renders a hidden placeholder.
- `ProjectCard` with `linkAs` renders through the given component.
- `App` routes: `/`, `/projects`, `/projects/<slug>`, `/projects/nope` (not found).
- `lint`, `type-check`, `test` and `build` stay green; CI unchanged.

## Risks

- Placeholder data must be replaced before launch; the contact email and social links in
  `SITE` are placeholders as well (`TODO(user)`).
- `/projects/:slug` is served by the nginx SPA fallback; verified in Docker.

## Execution constraints (from the user)

Use only Sonnet 5.5 and a single agent in this terminal, executed inline. No subagents.
