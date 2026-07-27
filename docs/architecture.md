# Architecture

## 1. Directory Structure

```
/
├── CLAUDE.md                      # Project spec (auto-read by Claude)
├── docs/                          # Detailed specifications
├── index.html                     # Vite entry HTML
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── .prettierrc                    # Prettier configuration
├── eslint.config.js               # ESLint flat configuration
├── .env.example                   # Environment variable template
├── .gitignore
├── package.json
└── src/
    ├── main.tsx                   # Vite entry point
    ├── app/                       # Application shell
    │   ├── App.tsx                # Root component
    │   ├── routes.tsx             # Route definitions (React.lazy)
    │   └── providers.tsx          # Context providers wrapper
    ├── features/                  # Feature modules
    │   ├── auth/
    │   │   ├── components/        # LoginForm, ProtectedRoute
    │   │   ├── hooks/             # useAuth
    │   │   ├── services/          # authService
    │   │   ├── store.ts           # Zustand auth store
    │   │   ├── types.ts
    │   │   └── index.ts
    │   ├── notes/
    │   │   ├── components/        # NoteCard, NoteContent, NoteHeader
    │   │   ├── hooks/             # useNoteDetail, useNoteList
    │   │   ├── services/          # noteService, noteGenerationService
    │   │   ├── store.ts
    │   │   ├── types.ts
    │   │   └── index.ts
    │   ├── transcription/
    │   │   ├── components/        # LiveTranscription, TranscriptionPanel, LanguageModal
    │   │   ├── hooks/             # useDeepgramTranscription, useTranscripts
    │   │   ├── services/          # deepgramService
    │   │   ├── store.ts           # Zustand transcript store
    │   │   ├── types.ts
    │   │   └── index.ts
    │   ├── ai/
    │   │   ├── components/        # AiAssistant, ContentDisplay
    │   │   ├── services/          # aiService
    │   │   ├── types.ts
    │   │   └── index.ts
    │   ├── quiz/
    │   │   ├── components/        # QuizPanel
    │   │   ├── services/          # quizGenerationService
    │   │   ├── types.ts
    │   │   └── index.ts
    │   ├── flashcards/
    │   │   ├── components/        # FlashcardPanel
    │   │   ├── services/          # flashcardGenerationService
    │   │   ├── types.ts
    │   │   └── index.ts
    │   ├── folders/
    │   │   ├── components/        # FolderList, FolderContextMenu
    │   │   ├── hooks/             # useFolders
    │   │   ├── services/          # folderService
    │   │   ├── types.ts
    │   │   └── index.ts
    │   └── youtube/
    │       ├── components/        # YouTubeModal
    │       ├── services/          # youtubeService
    │       ├── types.ts
    │       └── index.ts
    ├── shared/                    # Cross-feature shared code
    │   ├── components/
    │   │   ├── ui/                # Design system components
    │   │   │   ├── Button/
    │   │   │   ├── Modal/
    │   │   │   ├── Toast/
    │   │   │   ├── Tabs/
    │   │   │   ├── Card/
    │   │   │   ├── Input/
    │   │   │   └── ...
    │   │   └── layout/            # Layout components
    │   │       ├── AppLayout.tsx
    │   │       ├── Sidebar/
    │   │       ├── Navbar.tsx
    │   │       └── PageContainer.tsx
    │   ├── hooks/
    │   │   ├── useDebounce.ts
    │   │   ├── useAsync.ts
    │   │   ├── useToast.ts
    │   │   └── useReducedMotion.ts
    │   ├── lib/
    │   │   ├── httpClient.ts      # Axios instance + interceptors
    │   │   ├── logger.ts          # Structured logging
    │   │   ├── config.ts          # API URLs, constants
    │   │   ├── env.ts             # Environment variable access
    │   │   └── motion.ts          # Framer Motion presets
    │   ├── types/
    │   │   ├── common.ts          # Shared types (Pagination, ApiResponse, etc.)
    │   │   └── index.ts
    │   └── styles/
    │       ├── variables.css      # CSS custom properties (design tokens)
    │       ├── globals.css        # Tailwind directives + base styles
    │       └── vendor.css         # Third-party overrides (React Flow, Tiptap, Mermaid)
    └── db/                        # Database layer
        ├── schema.ts              # Dexie table definitions
        ├── operations.ts          # CRUD functions
        ├── sync.ts                # Offline sync queue
        └── index.ts
```

## 2. Module Boundaries

### Feature Module Rules

Each feature module (`src/features/{name}/`) is a self-contained domain:

1. **Can import from**: `@shared/*`, its own directory
2. **Cannot import from**: other feature modules directly
3. **Cross-feature communication**: via Zustand stores or event bus (not direct imports)

```
features/notes/ → CAN import from → @shared/components/ui/Button
features/notes/ → CANNOT import from → features/quiz/components/QuizPanel
features/notes/ → CAN read from → features/quiz/store (via Zustand)
```

### Public API via index.ts

Each feature exports only what other modules need:

```typescript
// features/notes/index.ts
export { NoteCard } from './components/NoteCard';
export { useNoteDetail } from './hooks/useNoteDetail';
export type { Note, NoteData } from './types';
// Internal components like NoteHeader are NOT exported
```

## 3. State Management

### Decision Matrix

| State Type | Tool | Example |
|-----------|------|---------|
| Server cache / async data | Zustand + service calls | Notes list, user profile |
| Cross-component UI state | Zustand store | Sidebar open/closed, current tab |
| Theme | React Context | Light/dark mode |
| Form values | `useState` | Input values, form state |
| Transient UI state | `useState` | Dropdown open, tooltip visible |

### Zustand Store Pattern

```typescript
// features/notes/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  fetchNotes: () => Promise<void>;
  addNote: (note: Note) => void;
}

export const useNotesStore = create<NotesState>()((set) => ({
  notes: [],
  isLoading: false,
  fetchNotes: async () => {
    set({ isLoading: true });
    try {
      const notes = await noteService.fetchAll();
      set({ notes, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
}));
```

### Forbidden Patterns

- **No Redux** — removed from project
- **No module-level `setInterval`** — use Visibility API or event-driven updates:
  ```typescript
  // Bad
  setInterval(syncQueue, 5 * 60 * 1000); // Runs even when tab is hidden

  // Good
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncQueue();
  });
  ```
- **No global mutable variables** — all state in Zustand or component state

## 4. Data Flow

```
User Interaction
  ↓
Component (thin shell) → calls hook
  ↓
Hook (useNoteDetail) → calls service + updates store
  ↓
Service (noteService) → httpClient.get() / Dexie operations
  ↓
Dexie (IndexedDB)     → local-first storage
  ↓
Sync Queue             → batches changes for server
  ↓
Backend API            → persistent storage
```

### Offline-First Pattern

1. All reads go to Dexie first (instant)
2. Writes save to Dexie + add to sync queue
3. Sync queue processes when online + tab visible
4. Conflicts: server wins (last-write-wins)

## 5. Routing

### Lazy Loading

All route components are lazy-loaded:

```typescript
// app/routes.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageSkeleton } from '@shared/components/ui';

const Dashboard = lazy(() => import('@features/notes/pages/Dashboard'));
const NoteDetail = lazy(() => import('@features/notes/pages/NoteDetail'));
const Notes = lazy(() => import('@features/notes/pages/Notes'));
const TranscriptionPage = lazy(() => import('@features/transcription/pages/TranscriptionPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/notes/:noteId" element={<ProtectedRoute><NoteDetail /></ProtectedRoute>} />
        <Route path="/folders/:folderId" element={<ProtectedRoute><FolderPage /></ProtectedRoute>} />
        <Route path="/transcription" element={<TranscriptionPage />} />
      </Routes>
    </Suspense>
  );
}
```

### Route Structure

| Path | Component | Protected | Layout |
|------|-----------|-----------|--------|
| `/` | Home | No | None (full page) |
| `/login` | Login | No | None (full page) |
| `/dashboard` | Dashboard | Yes | AppLayout (sidebar) |
| `/notes` | Notes | Yes | AppLayout |
| `/notes/:noteId` | NoteDetail | Yes | AppLayout |
| `/folders/:folderId` | FolderPage | Yes | AppLayout |
| `/transcription` | TranscriptionPage | No | None |

## 6. Environment Variables

### Access Pattern

```typescript
// shared/lib/env.ts — SINGLE source of truth
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
} as const;
```

**Rule**: Components and services import from `@shared/lib/env` — never read `import.meta.env` directly.

### Environment Files

| File | Purpose | Committed to git? |
|------|---------|-------------------|
| `.env.example` | Template with placeholder values | Yes |
| `.env` | Local development values | **No** |
| `.env.production` | Production overrides | **No** |

### Security Rule

**No API keys in frontend code.** All third-party API calls (Deepgram, SiliconFlow) must be proxied through the backend. The frontend only knows the backend URL.

## 7. Error Handling Architecture

### Three Layers

```
Layer 1: Service         → catch, log, re-throw
Layer 2: Hook            → catch, set error state, show toast
Layer 3: ErrorBoundary   → catch uncaught, show fallback UI
```

### Error Boundary Placement

```tsx
// App-level: catches everything
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Route-level: catches page errors without killing the app
<Route path="/notes/:id" element={
  <ErrorBoundary fallback={<ErrorState retry={...} />}>
    <NoteDetail />
  </ErrorBoundary>
} />
```

## 8. Performance Conventions

1. **Code splitting**: All routes lazy-loaded, heavy libraries dynamically imported
2. **Memoization**: `useCallback` for handlers passed as props, `useMemo` for expensive computations
3. **Image optimization**: Lazy load images below the fold
4. **Bundle analysis**: Use `rollup-plugin-visualizer` to monitor bundle size
5. **Heavy libraries** (dynamic import only):
   - `html2pdf.js` — only in NoteDetail export
   - `markmap-lib` + `markmap-view` — only in MindmapPanel
   - `pdfjs-dist` — only in document upload
   - `mermaid` — only in diagram rendering
