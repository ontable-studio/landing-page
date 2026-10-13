# OnTable Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task, inline in this terminal. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Execution constraint (from the user):** use only the Sonnet 5.5 model and a single agent in this terminal. Do not spawn subagents or parallel agents.

**Goal:** Build the OnTable site: a Home page with one Hero section, a Projects page, and project detail pages.

**Architecture:** Project content lives in one typed data file (`src/data/projects.ts`). Pages in `src/pages/` compose the existing design-system primitives; `react-router` provides client-side navigation. `ProjectCard` stays router-free and takes an optional `linkAs` component.

**Tech Stack:** React 19, react-router, Tailwind v4 (design-system tokens), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-13-landing-pages-design.md`

## Global Constraints

- All constraints of `docs/superpowers/plans/2026-10-13-design-system.md` still apply: inline Tailwind only, no custom CSS classes, `rounded-2xl`/`rounded-3xl`/`rounded-full`, `font-display` (Poppins Bold) for hero and headings only, light theme, no blue, tabs for indentation.
- Components and pages follow the existing layout: a component folder has `Name.tsx`, `index.ts`, `Name.test.tsx`; pages are `src/pages/Name.tsx` with `Name.test.tsx` beside them.
- Tests wrap anything using `Link` in `MemoryRouter` from `react-router`.
- Each task leaves lint, type-check and tests green (the pre-commit hook enforces it). Conventional Commits.
- Work on branch `feat/landing-pages`; do not merge or push without the user's say-so.
- Placeholder content only: names such as "Placeholder Game One", gradients instead of images. `SITE.email` and `SITE.social` stay `TODO(user)` placeholders.

## Review Focus

- A project with no `image`, no `gallery` entries or empty `credits` must still render a complete detail page without crashing.
- `/projects/<unknown-slug>` renders the not-found view with a way home, and the tab title says so.
- A very long project title must not overflow on the card or the detail page (`ProjectCard` clamps; the detail `h1` wraps).
- Card clicks must navigate client-side (no full reload) while a plain `ProjectCard` without `linkAs` still renders a normal `<a>`.
- The Hero's decorative mark must be hidden from assistive technology and must not push the buttons off small screens (320px wide).

---

### Task 1: Project data and `useDocumentTitle`

**Files:**

- Create: `src/data/projects.ts`, `src/data/projects.test.ts`, `src/lib/useDocumentTitle.ts`, `src/lib/useDocumentTitle.test.tsx`
- Modify: `src/lib/index.ts`

**Interfaces:**

- Produces: `interface Project { slug: string; title: string; category: string; year: number; summary: string; image?: string; credits: { label: string; value: string }[]; gallery: { src?: string; alt: string }[] }`; `projects: Project[]` (four placeholders); `getProject(slug: string): Project | undefined`; `useDocumentTitle(title: string): void`, exported from `src/lib/index.ts`.

- [ ] **Step 1: Write the failing tests.** `projects.test.ts`: every slug matches `/^[a-z0-9]+(-[a-z0-9]+)*$/`; slugs are unique; each project has a non-empty `summary` and `title`; `projects.length` is at least 3; `getProject(projects[0].slug)` returns that project; `getProject("nope")` is `undefined`. `useDocumentTitle.test.tsx`: a test component calling `useDocumentTitle("Projects — OnTable")` sets `document.title`; rerendering with a new title updates it.
- [ ] **Step 2: Run `npx vitest run src/data src/lib` and confirm both fail** (modules missing).
- [ ] **Step 3: Implement** both modules to the signatures above. `useDocumentTitle` uses `useEffect` keyed on `title`. Placeholder projects: "Placeholder Game One" (Puzzle, 2026), "Placeholder Game Two" (Platformer, 2025), "Placeholder Tool" (Tool, 2025), "Placeholder Jam Entry" (Game Jam, 2024); give each two or three credits (Date, Role, Platform) and two gallery items without `src`; the last project has `credits: []` and `gallery: []` to exercise the empty case.
- [ ] **Step 4: Run the tests, lint and type-check; all pass.**
- [ ] **Step 5: Commit** `feat(data): add placeholder projects and useDocumentTitle`

### Task 2: `ProjectCard` `linkAs` and `RouterLink`

**Files:**

- Modify: `src/components/ui/ProjectCard/ProjectCard.tsx`, `src/components/ui/ProjectCard/ProjectCard.test.tsx`
- Create: `src/components/layout/RouterLink/{RouterLink.tsx,index.ts,RouterLink.test.tsx}`; Modify: `src/components/layout/index.ts`

**Interfaces:**

- Consumes: `Link` from `react-router`.
- Produces: `ProjectCard` prop `linkAs?: React.ElementType` (default `"a"`); the element receives `href`, `className` and the card content. `RouterLink({ href, ...props }: React.ComponentProps<"a"> & { href: string }): React.JSX.Element` renders `<Link to={href} {...props} />`.

- [ ] **Step 1: Write the failing tests.** ProjectCard: with `href="/x"` and `linkAs={Probe}` where `Probe` is a test component rendering `<a data-probe href={href} className={className}>{children}</a>`, the `[data-probe]` element exists with `href="/x"`; without `linkAs`, the link is a plain `a` with no `data-probe`. RouterLink in a `MemoryRouter`: renders a link whose `href` is the given path, and clicking it does not call `window.location.assign` / reload (assert via `userEvent.click` then the link is still in the document and the router location changed, using a `useLocation` probe component).
- [ ] **Step 2: Run, confirm the new tests fail.**
- [ ] **Step 3: Implement** `linkAs` (use it in place of the literal `a` when `href` is given) and `RouterLink`.
- [ ] **Step 4: Run all tests, lint and type-check; pass.**
- [ ] **Step 5: Commit** `feat(ui): let ProjectCard render through a custom link`

### Task 3: Home with the Hero section

**Files:**

- Modify: `src/pages/Home.tsx`
- Create: `src/pages/Home.test.tsx`

**Interfaces:**

- Consumes: `SITE`, `Button`, `useDocumentTitle`.
- Produces: default export `Home()`; the mark is `<img src="/images/ontable-logo.svg" alt="" aria-hidden="true">`.

- [ ] **Step 1: Write the failing tests** (in `MemoryRouter`): an `h1` whose text is `SITE.tagline`; a link "View projects" with `href="/projects"`; a link "Contact" with `href` `mailto:${SITE.email}`; `document.title` is `OnTable`; the mark image has `alt=""` and `aria-hidden="true"`; the page contains exactly one `section`.
- [ ] **Step 2: Run, confirm failure.**
- [ ] **Step 3: Implement** the Hero per the spec: one `section` at `min-h-[calc(100svh-4rem)]`, orange radial glow (inline `bg-radial` utilities), the large mark positioned decoratively behind the text and clipped so it never forces horizontal scroll (`overflow-hidden` on the section), headline `text-h1 lg:text-display font-display`, one `body-lg` line (`text-text-secondary`), and the two `Button`s (primary "View projects" via `RouterLink`-style `Link` is not needed: use `Button` with `href="/projects"` since it is a one-off, or a router `Link` styled with `buttonVariants` if a full reload is unacceptable; prefer the `Link` with `buttonVariants`). Entrances use `animate-rise`.
- [ ] **Step 4: Run all tests, lint, type-check and build; pass. Check 320px and 1280px widths in the browser: no horizontal scroll, buttons visible.**
- [ ] **Step 5: Commit** `feat(pages): add the Hero home page`

### Task 4: Projects page

**Files:**

- Create: `src/pages/Projects.tsx`, `src/pages/Projects.test.tsx`

**Interfaces:**

- Consumes: `projects`, `ProjectCard`, `RouterLink`, `SectionHeader`, `Container`, `useDocumentTitle`.
- Produces: default export `Projects()`.

- [ ] **Step 1: Write the failing tests** (in `MemoryRouter`): a level-1 heading "Projects"; for every project a link with `href` `/projects/<slug>` containing its title; `document.title` is `Projects — OnTable`; the number of project links equals `projects.length`.
- [ ] **Step 2: Run, confirm failure.**
- [ ] **Step 3: Implement** the page: `SectionHeader` (`as="h1"`, eyebrow "Our work", title "Projects"), then a single column (`flex flex-col gap-8`) of `ProjectCard`s with `linkAs={RouterLink}`, `href={`/projects/${slug}`}`, `image` when present.
- [ ] **Step 4: Run all tests, lint, type-check; pass.**
- [ ] **Step 5: Commit** `feat(pages): add the Projects page`

### Task 5: Project detail page and routes

**Files:**

- Create: `src/pages/ProjectDetail.tsx`, `src/pages/ProjectDetail.test.tsx`
- Modify: `src/App.tsx`, `src/App.test.tsx`, `src/pages/NotFound.tsx`

**Interfaces:**

- Consumes: `getProject`, `useParams` from `react-router`, `Badge`, `Button`, `Container`, `useDocumentTitle`, `NotFound`.
- Produces: default export `ProjectDetail()`; routes `/projects` → `Projects`, `/projects/:slug` → `ProjectDetail`. `NotFound` sets the title `Page not found — OnTable`.

- [ ] **Step 1: Write the failing tests.** ProjectDetail (render with `MemoryRouter initialEntries` and a `Routes` entry for `/projects/:slug`): for the first project, a level-1 heading with its title, its summary, every credit label and value, a link "Back" to `/projects`, and `document.title` `<title> — OnTable`; a gallery item without `src` renders a hidden placeholder (`aria-hidden="true"`) and no broken `img`; the project with `credits: []` and `gallery: []` still renders its heading and summary without a credits list; a 150-character title still renders; an unknown slug renders the not-found heading "Page not found" and title `Page not found — OnTable`. App routes: `/projects` shows the Projects heading, `/projects/<first slug>` shows that project's heading, `/projects/nope` shows not found.
- [ ] **Step 2: Run, confirm failure.**
- [ ] **Step 3: Implement** the page per the spec (back `Button` outline link, hero area with `image` or a gradient, `h1` in `font-display` that wraps (`break-words`), category `Badge`, summary, credits as a `dl` only when non-empty, gallery grid only when non-empty), add the two routes to `App.tsx`, and set the title in `NotFound`.
- [ ] **Step 4: Run all tests, lint, type-check and build; pass.**
- [ ] **Step 5: Commit** `feat(pages): add project detail pages and routes`

### Task 6: Docs and verification

**Files:**

- Modify: `CLAUDE.md`, `README.md`

- [ ] **Step 1:** Update `CLAUDE.md` and `README.md`: the routes, `src/data/projects.ts` as the one place to edit project content (and that current entries are placeholders), `RouterLink`/`linkAs`.
- [ ] **Step 2:** Run `npm run lint && npm run type-check && npm test && npm run build`; all pass.
- [ ] **Step 3:** Build the Docker image, serve it, and request `/`, `/projects`, `/projects/<first slug>` (expect 200 each). In the dev server check the browser: Home, Projects and a detail page, clicking a card (no full reload), console free of errors, and 320px width without horizontal scroll.
- [ ] **Step 4: Commit** `docs: describe the pages and project data`

---

## Self-review

- **Spec coverage:** data and hook (1), `linkAs` and client-side links (2), Hero (3), Projects (4), detail, routes, not-found and titles (5), docs and Docker/browser checks (6).
- **Types:** `Project`, `getProject`, `useDocumentTitle` and `RouterLink` are defined once and used with the same names later.
- **Proportion:** the plan fixes names, values and assertions; component bodies are left to the implementer.
