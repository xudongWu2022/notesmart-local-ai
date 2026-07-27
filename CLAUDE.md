# NoteSmart

## Project Overview

AI-powered note-taking app: real-time speech transcription (Deepgram) + AI note generation (SiliconFlow) + quizzes/flashcards + mind maps.

**Tech Stack** (target): React 18 + Vite + TypeScript + Tailwind CSS 3 + Zustand + Dexie (IndexedDB)
**Current State**: Migrating from CRA + JavaScript. Some files are still `.js`.

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run tests (Vitest)
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run type-check   # TypeScript check (tsc --noEmit)
npm run format       # Prettier format
```

## Project Structure

```
src/
  app/                  # App shell (App.tsx, routes.tsx, providers.tsx)
  features/             # Feature modules
    auth/               # Authentication
    notes/              # Note CRUD, editing, export
    transcription/      # Real-time & file transcription
    ai/                 # AI assistant, note generation
    quiz/               # Quiz generation & interaction
    flashcards/         # Flashcard generation & review
    folders/            # Folder management
    youtube/            # YouTube transcript import
  shared/               # Cross-feature shared code
    components/ui/      # Design system (Button, Modal, Toast, etc.)
    components/layout/  # Layout (Sidebar, Navbar, PageContainer)
    hooks/              # Generic hooks (useDebounce, useAsync, useToast)
    lib/                # Utilities (httpClient, logger, config, env)
    types/              # Global type definitions
    styles/             # CSS files, design tokens
  db/                   # Dexie database (schema, operations, sync)
docs/                   # Detailed specifications (see links below)
```

## Coding Standards (Summary)

- **TypeScript strict**, no `any` (use `unknown` + type guards)
- **Component files < 200 lines** — extract `use{Name}.ts` hooks for logic
- **Naming**: PascalCase components, camelCase functions/variables, UPPER_SNAKE constants
- **Import order**: react > third-party > @shared > @features > relative > type imports
- **Forbidden**: `console.log` (use logger), `alert()` (use Toast), DOM-based notifications, `!important`, inline styles, `var`

## Component Standards (Summary)

- Use `src/shared/components/ui/` design system components
- Props must have TypeScript `interface` (`{ComponentName}Props`)
- All interactive elements need `aria-label` or associated `<label>`
- Use CSS variables for theming — never hardcode colors like `bg-white` without dark support
- `React.forwardRef` for components that need ref forwarding

## Design Tokens (Summary)

- **Primary**: blue-500 `#3b82f6` | **Secondary**: violet-500 `#8b5cf6`
- **Border radius**: sm(6px) md(8px) lg(12px) xl(16px) full(9999px)
- **Shadows**: 5 levels (xs → xl) + glass
- **Icons**: `react-icons/fi` (Feather Icons) only — no mixing icon libraries
- **Animations**: only `transform` + `opacity`, respect `prefers-reduced-motion`

## State Management

- **Zustand**: global/cross-component state (auth, notes, transcription)
- **React Context**: Theme provider only
- **Component state**: local UI state (form values, toggles)
- **Forbidden**: Redux, module-level setInterval, global mutable variables

## API Layer

- Single HTTP client: `shared/lib/httpClient.ts` (axios instance)
- No direct `fetch()` or standalone `axios.create()` in services
- API URLs centralized in `shared/lib/config.ts`
- Env vars read only from `shared/lib/env.ts` — never `import.meta.env` directly

## Git Conventions

- **Branches**: `feature/xxx`, `fix/xxx`, `refactor/xxx`, `docs/xxx`, `chore/xxx`
- **Commits**: Conventional Commits — `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- **Forbidden**: force push to master, commit `.env` / API keys / `node_modules`

## Detailed Specifications

- [Code Standards](docs/code-standards.md) — TypeScript, naming, file organization, ESLint/Prettier
- [Component Standards](docs/component-standards.md) — Atomic Design, Props API, accessibility, component list
- [Design Tokens](docs/design-tokens.md) — Colors, radius, shadows, typography, animations, icons
- [Architecture](docs/architecture.md) — Directory structure, state management, data flow, routing
- [API Standards](docs/api-standards.md) — HTTP client, service functions, error handling layers
- [Git Workflow](docs/git-workflow.md) — Branching, commits, PR requirements
