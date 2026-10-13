# OnTable — Landing Page

Landing page for OnTable Studio. Built with Vite, React 19, TypeScript and Tailwind CSS v4.

## Tech Stack

- **Build**: Vite
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint (flat config) + Prettier
- **Git hooks**: Husky + lint-staged + Commitlint (Conventional Commits)
- **CI**: GitHub Actions (lint, type-check, test, build)

## Getting Started

Requires Node.js 22 (see `.nvmrc`).

```bash
npm install
npm run dev
```

## Scripts

| Command                 | Description                         |
| ----------------------- | ----------------------------------- |
| `npm run dev`           | Start Vite dev server               |
| `npm run build`         | Type-check and build for production |
| `npm run preview`       | Preview production build            |
| `npm test`              | Run tests once                      |
| `npm run test:watch`    | Run tests in watch mode             |
| `npm run test:coverage` | Run tests with coverage             |
| `npm run type-check`    | Run TypeScript type-check           |
| `npm run lint`          | Lint source files                   |
| `npm run lint:fix`      | Lint and auto-fix                   |
| `npm run format`        | Format with Prettier                |

## Project Structure

```
src/
├── components/
│   ├── ui/       # Primitives (Button, Badge, Card, Container, ProjectCard)
│   └── layout/   # SectionHeader, Nav, Footer
├── pages/        # Routes: /, /projects, /projects/:slug, /design-system
├── data/         # Project content (projects.ts, placeholders for now)
├── common/       # Site constants
├── lib/          # Core utilities (cn)
├── styles/       # Theme tokens and base styles
├── App.tsx
└── main.tsx
```

Open `/design-system` in dev to see every token and component.

## Docker

```bash
docker build -t ontable-landing-page .
docker run -p 8080:80 ontable-landing-page
```
