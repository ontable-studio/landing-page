# OnTable Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task, inline in this terminal. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Execution constraint (from the user):** use only the Sonnet 5.5 model and a single agent in this terminal. Do not spawn subagents or parallel agents.

**Goal:** Build the OnTable design system: tokens, UI primitives, and a living style guide at `/design-system`.

**Architecture:** Tokens live in Tailwind v4 `@theme` in `src/styles/main.css`. Components are `cva` + `cn()` primitives, one folder each (component, `index.ts`, test), styled with inline utilities only. `react-router` serves `/` (placeholder) and `/design-system`.

**Tech Stack:** Vite 8, React 19, TypeScript, Tailwind CSS v4, class-variance-authority, Vitest + Testing Library, react-router, fontsource (Instrument Sans, IBM Plex Mono).

**Spec:** `docs/superpowers/specs/2026-10-13-design-system-design.md`

## Global Constraints

- `main.css` holds only `@theme`, `@layer base` and `@font-face`. No `@layer components`.
- Inline Tailwind utilities in TSX; no custom component classes. Write classes as-is; `npm run lint:fix` and `npm run format` canonicalize and sort them.
- Light theme only. No blue anywhere. Brand is orange (`orange-500` = `#F5611F`).
- `--font-display` is the only reference to Blippo Black; display font is for hero and headings only.
- Radius: `rounded-2xl`, `rounded-3xl` only. Arbitrary breakpoints `max-[720px]` / `min-[576px]` are allowed.
- Motion is disabled under `prefers-reduced-motion`.
- Every component folder: `Name.tsx`, `index.ts` (`export { Name } from "./Name";`), `Name.test.tsx`.
- Imports use relative paths and `cn` from `src/lib/cn.ts`. Tabs for indentation.
- Commits follow Conventional Commits; pre-commit runs lint-staged, type-check and tests, so each task must leave all three green.
- Do not copy the Blippo Black font file into the repo until the user confirms its licence (Task 9).

## Review Focus

- Text on orange: white on `orange-500` is about 3.3:1, so button labels must be semibold at 16px or larger, and `brand-hover` must stay darker than `brand`. A test pins the Button size and weight classes.
- `ProjectCard` with a long title, a missing image or no `href` must not overflow the frame or crash.
- `Button` given an `href` and a `disabled`-like intent: renders as `<a>` and never as a button with an `href`.
- `Nav` with the mobile menu open: pressing Escape closes it and focus returns to the toggle.
- Unknown route such as `/nope` renders the not-found view, not a blank page.

---

### Task 1: Tokens, fonts and `cn()`

**Files:**

- Modify: `src/styles/main.css`, `src/lib/cn.ts`, `src/lib/cn.test.ts`, `package.json`
- Create: `src/styles/tokens.test.ts`

**Interfaces:**

- Produces: Tailwind tokens `brand`, `brand-hover`, `canvas`, `surface`, `surface-border`, `text-primary|secondary|tertiary`, scales `orange-50…900` and `ink-50…900`; font utilities `font-display|sans|mono`; text utilities `text-display|h1|h2|h3|h4|title|body-lg|body|body-sm|label|caption`; spacing `py-section` and `py-section-lg`; animations `animate-rise`, `animate-fade-in`; `cut-corner` utility. `cn()` knows the custom text sizes.

- [ ] **Step 1: Write the failing tests**

In `src/lib/cn.test.ts` add:

```ts
describe("cn with the theme's custom text tokens", () => {
	it("keeps a text colour next to a custom font-size token", () => {
		expect(cn("text-text-primary", "text-h2")).toBe(
			"text-text-primary text-h2"
		);
	});
	it("lets a custom font-size token replace a default one", () => {
		expect(cn("text-base", "text-body")).toBe("text-body");
	});
});
```

In `src/styles/tokens.test.ts` read `main.css` with `node:fs` and assert it contains `--color-brand:`, `--color-orange-500: #f5611f`, `--font-display:`, `--text-display:`, `--spacing-section:`, no `@layer components`, and no `blue`.

- [ ] **Step 2: Run `npx vitest run src/lib src/styles` and confirm both files fail.**

- [ ] **Step 3: Implement.** `npm install @fontsource-variable/instrument-sans @fontsource/ibm-plex-mono`. In `cn.ts` use `extendTailwindMerge` with a `"font-size"` class group listing the eleven size names. In `main.css` write `@import "tailwindcss"`, `@font-face` rules (Instrument Sans variable woff2 from fontsource, IBM Plex Mono 400 and 500, `font-display: swap`; Blippo Black `src: url("/fonts/blippo-black.otf")` with `font-display: swap`), and `@theme` with:
  - `orange` 50–900: `#fff3ec #ffe0cf #ffc2a1 #ff9d68 #fa7b3c #f5611f #dc4a0f #b53a0c #8f2f0e #6e260f`
  - `ink` 50–900: `#f7f5f3 #ebe7e3 #d6d0c9 #b3aba2 #8c847b #6b645c #524c46 #3b3733 #272421 #171513`
  - aliases: `brand` = orange-500, `brand-hover` = orange-600, `canvas` = `#ffffff`, `surface` = ink-50, `surface-border` = ink-100, `text-primary` = ink-900, `text-secondary` = ink-500, `text-tertiary` = ink-300 (decorative only)
  - fonts: `--font-display: "Blippo Black", "Chango", "Arial Black", sans-serif`; `--font-sans: "Instrument Sans Variable", "Instrument Sans", sans-serif`; `--font-mono: "IBM Plex Mono", monospace`
  - type scale, px / line-height: display 88/1, h1 56/1.05, h2 44/1.1, h3 32/1.15, h4 24/1.25, title 20/1.3, body-lg 20/1.4, body 16/1.5, body-sm 14/1.5, label 12/1.3 (mono, uppercase via class), caption 12/1.4
  - `--spacing-section: 80px`, `--spacing-section-lg: 120px`
  - animations `rise` (opacity 0 and translate-y 20px to rest, 800ms) and `fade-in` (450ms)
  - `@layer base`: `body` uses `font-sans`, `bg-canvas`, `text-text-primary`; a `prefers-reduced-motion: reduce` block sets animation and transition durations to near zero
  - `@utility cut-corner` with `clip-path: polygon(0 0, calc(100% - 3.5rem) 0, 100% 3.5rem, 100% 100%, 0 100%)`

- [ ] **Step 4: Run `npx vitest run src/lib src/styles` and `npm run lint && npm run type-check`; all pass.**

- [ ] **Step 5: Commit** `feat(design-system): orange tokens, fonts and type scale`

### Task 2: Container, Card and Badge

**Files:**

- Create: `src/components/ui/{Container,Card,Badge}/{Name.tsx,index.ts,Name.test.tsx}`, `src/components/ui/index.ts`

**Interfaces:**

- Produces: `Container({ size?: "default" | "narrow"; className?; children })`, `Card({ variant?: "flat" | "bordered" | "elevated"; className?; children })`, `Badge({ variant?: "brand" | "neutral" | "outline"; className?; children })`, plus exported `containerVariants`, `cardVariants`, `badgeVariants`. All spread remaining HTML props onto a `div` (`Container`, `Card`) or `span` (`Badge`). `ui/index.ts` re-exports every `ui` component.

- [ ] **Step 1: Write failing tests** for each: renders children; the default variant class set (`Container`: `max-w-6xl` and `mx-auto`; `narrow`: `max-w-3xl`. `Card` `bordered`: `border`; `elevated`: `shadow`. `Badge` `brand`: `bg-brand`; all `Badge`s include `font-mono`, `uppercase`); passing `className` is merged last.
- [ ] **Step 2: Run `npx vitest run src/components/ui` and confirm failure.**
- [ ] **Step 3: Implement** with `cva`, `rounded-2xl` for `Card`, `rounded-full` for `Badge`, gutters `px-6` on `Container`.
- [ ] **Step 4: Run the tests, lint and type-check; pass.**
- [ ] **Step 5: Commit** `feat(ui): add Container, Card and Badge`

### Task 3: Button

**Files:**

- Create: `src/components/ui/Button/{Button.tsx,index.ts,Button.test.tsx}`
- Modify: `src/components/ui/index.ts`

**Interfaces:**

- Produces: `Button(props: ButtonProps): React.JSX.Element` and `buttonVariants`, where `ButtonProps = OwnProps & (React.ComponentProps<"button"> & { href?: undefined } | React.ComponentProps<"a"> & { href: string })`, `OwnProps = { variant?: "primary" | "outline" | "ghost" | "link"; size?: "sm" | "md" | "lg"; arrow?: boolean }`. Default `primary` / `md`.

- [ ] **Step 1: Write failing tests:** renders a `button` role without `href`; renders a `link` role with `href="/projects"` and no `button` role; `primary` has `bg-brand`; `md` and `lg` have `font-semibold`; `arrow` renders an `svg` with `aria-hidden="true"`; `onClick` fires.
- [ ] **Step 2: Run, confirm failure.**
- [ ] **Step 3: Implement** modelled on the Coding Folks `Button` (single component, `<a>` when `href`). Pill shape (`rounded-full`), `cursor-pointer`, focus ring `focus-visible:outline-2` in brand colour, `primary` hover `bg-brand-hover`. Add a small inline `ArrowUpRight` svg inside `Button.tsx`.
- [ ] **Step 4: Tests, lint, type-check pass.**
- [ ] **Step 5: Commit** `feat(ui): add Button`

### Task 4: ProjectCard

**Files:**

- Create: `src/components/ui/ProjectCard/{ProjectCard.tsx,index.ts,ProjectCard.test.tsx}`
- Modify: `src/components/ui/index.ts`

**Interfaces:**

- Consumes: `cn`, `Badge`.
- Produces: `ProjectCard({ title: string; category: string; year: number | string; image?: string; imageAlt?: string; href?: string; className?: string }): React.JSX.Element`. Renders an `<a>` when `href` is given, otherwise a `div`.

- [ ] **Step 1: Write failing tests:** heading with `title`; the `category` and `year` texts present; with `href` it is a link to it; without `href` there is no link; with `image` an `img` with `alt` equal to `imageAlt ?? title`; without `image` a placeholder block with `aria-hidden="true"` renders instead; the frame element has the `cut-corner` class; a 120-character title still renders (and carries `line-clamp-2`).
- [ ] **Step 2: Run, confirm failure.**
- [ ] **Step 3: Implement.** Framed panel (`rounded-3xl`, `border`, `p-2`) around an `overflow-hidden` image area with `cut-corner` and `aspect-[16/10]`; year sits in the cut corner top-right in `font-mono`; title (`font-display`) and category (`Badge`) bottom-left over a gradient scrim; image `group-hover:scale-105` with `transition-transform`, `object-cover`.
- [ ] **Step 4: Tests, lint, type-check pass.**
- [ ] **Step 5: Commit** `feat(ui): add ProjectCard`

### Task 5: SectionHeader, Nav and Footer

**Files:**

- Create: `src/components/layout/{SectionHeader,Nav,Footer}/{Name.tsx,index.ts,Name.test.tsx}`, `src/components/layout/index.ts`, `src/common/constants.ts`, `public/images/ontable-logo.svg` (copy of `.resources/new logo/ontable.svg`)
- Create: `src/components/layout/README.md` (one paragraph on conventions)

**Interfaces:**

- Consumes: `Container`, `Button`, `cn`.
- Produces: `SITE = { name: "OnTable Studio", tagline: "We make games from our table. To your table.", email: string, social: { label: string; href: string }[] }` (email and social entries as placeholders the user fills in; keep the keys, mark values with a `// TODO(user)` comment). `SectionHeader({ eyebrow?: string; title: string; description?: string; as?: "h1" | "h2" })`. `Nav()` with links Projects (`/projects`) and Contact (`mailto:${SITE.email}`), logo linking to `/`. `Footer()`.

- [ ] **Step 1: Write failing tests:** `SectionHeader` renders `title` as a heading of the level given by `as` (default `h2`), eyebrow only when provided. `Nav`: logo link has `href="/"`; Projects link present; the menu toggle has `aria-expanded="false"`, clicking sets it `"true"`, pressing Escape sets it back to `"false"` and focuses the toggle. `Footer` renders `SITE.tagline`. Wrap in `MemoryRouter` from `react-router`.
- [ ] **Step 2: Run, confirm failure** (also install `react-router` here: `npm install react-router`).
- [ ] **Step 3: Implement.** `Nav` is sticky, `bg-canvas/90 backdrop-blur`, links use react-router `Link`; mobile toggle (`max-[720px]`) with a button that reveals the links. `Footer` is a simple `Container` row.
- [ ] **Step 4: Tests, lint, type-check pass.**
- [ ] **Step 5: Commit** `feat(layout): add SectionHeader, Nav and Footer`

### Task 6: Routing, shell and nginx fallback

**Files:**

- Modify: `src/main.tsx`, `src/App.tsx`, `src/App.test.tsx`, `nginx.conf`
- Create: `src/pages/Home.tsx`, `src/pages/NotFound.tsx`, `src/pages/DesignSystem.tsx` (a stub returning an `h1` "Design System", replaced in Task 7)

**Interfaces:**

- Consumes: `Nav`, `Footer`, `SectionHeader`.
- Produces: `App()` renders `Nav`, a `Routes` block and `Footer` inside whatever router wraps it (`BrowserRouter` is added in `main.tsx`, so tests wrap `App` in `MemoryRouter`). Routes: `/` → `Home`, `/design-system` → `DesignSystem`, `*` → `NotFound`.

- [ ] **Step 1: Write failing tests** in `App.test.tsx`: at `/` the "OnTable" heading renders; at `/design-system` a heading "Design System" renders; at `/nope` a heading containing "not found" (case-insensitive) renders and a link back to `/`.
- [ ] **Step 2: Run, confirm failure.**
- [ ] **Step 3: Implement.** `Home` is a placeholder with the studio name as `h1` and the tagline. In `nginx.conf`, change `location /` to `try_files $uri $uri/ /index.html;` and keep `error_page 404 /404.html` for the `/assets/` and `/images/` locations.
- [ ] **Step 4: Run all tests, lint, type-check and `npm run build`; pass.**
- [ ] **Step 5: Commit** `feat(app): add routing and page shell`

### Task 7: Style guide page

**Files:**

- Modify: `src/pages/DesignSystem.tsx`
- Create: `src/pages/design-system/{ColorSection,TypographySection,SpacingSection,MotionSection,ComponentsSection}.tsx`, `src/pages/design-system/tokens.data.ts`, `src/pages/DesignSystem.test.tsx`

**Interfaces:**

- Consumes: every `ui` and `layout` component.
- Produces: `colorGroups: { name: string; swatches: { token: string; hex: string }[] }[]` and `typeScale: { token: string; className: string; sample: string }[]` in `tokens.data.ts`, copied from Task 1's values. Sections render with ids `colours`, `typography`, `spacing`, `motion`, `components`; a sticky mini-nav links to each.

- [ ] **Step 1: Write failing tests:** the five section headings render; every `colorGroups` swatch token appears in the document; one element exists per `typeScale` entry; the mini-nav has five links whose `href`s are `#colours`, `#typography`, `#spacing`, `#motion`, `#components`; a test in `tokens.data` territory asserts each swatch hex matches `/^#[0-9a-f]{6}$/i` and `orange-500` is `#f5611f`.
- [ ] **Step 2: Run, confirm failure.**
- [ ] **Step 3: Implement.** Components section shows every `Button` variant and size, `Badge` variants, `Card` variants and a `ProjectCard` with and without an image. Motion section has a "Replay" `Button` that re-mounts the animated box by changing its `key`. Add a short note under Colours about white-on-orange contrast.
- [ ] **Step 4: Tests, lint, type-check, build pass; run `npm run dev` and look at `/design-system` in the browser.**
- [ ] **Step 5: Commit** `feat(design-system): add living style guide page`

### Task 8: Docs and verification

**Files:**

- Modify: `CLAUDE.md`, `README.md`

- [ ] **Step 1:** Update `CLAUDE.md` (structure: `ui/`, `layout/`, `pages/`; token rules; display font rule; the Sonnet 5.5 single-agent execution rule) and `README.md` (project structure, `/design-system` route).
- [ ] **Step 2:** Run `npm run lint && npm run type-check && npm test && npm run build`; all pass.
- [ ] **Step 3:** Run `docker build` and serve the image; confirm `/design-system` returns 200 (the SPA fallback).
- [ ] **Step 4: Commit** `docs: describe the design system`

### Task 9: Ship the display font (gated)

**Do not start until the user confirms Blippo Black may be used.**

- [ ] **Step 1:** Ask the user whether Blippo Black is cleared. If yes, copy `.resources/Blippo Black Regular/Blippo Black Regular.otf` to `public/fonts/blippo-black.otf`. If no, replace the first family in `--font-display` and the `@font-face` with the free substitute the user picks (default: Chango via `@fontsource/chango`).
- [ ] **Step 2:** Run the style guide, confirm the display font renders, then lint, type-check, test and build.
- [ ] **Step 3: Commit** `feat(design-system): ship the display font`; push `main` and confirm CI is green.

---

## Self-review

- **Spec coverage:** tokens (Task 1), primitives (Tasks 2–5), style guide (7), routing and nginx (6), testing throughout, docs (8), font risk (9), execution constraint (header).
- **Types:** `ButtonProps`, `ProjectCard` props and `SITE` are defined once and used with the same names in Tasks 5–7.
- **Proportion:** the plan fixes names, values and assertions; component bodies are left to the implementer.
