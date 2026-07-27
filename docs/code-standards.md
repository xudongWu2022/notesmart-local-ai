# Code Standards

## 1. TypeScript

### Strict Mode

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Type Rules

| Rule | Do | Don't |
|------|-----|-------|
| No `any` | `unknown` + type guard | `any` |
| Object shapes | `interface UserProps { ... }` | `type UserProps = { ... }` (reserve `type` for unions/intersections) |
| Props naming | `interface ButtonProps` | `interface IButtonProps` or `interface ButtonPropsType` |
| Enums | `const STATUS = { IDLE: 'idle', LOADING: 'loading' } as const` | `enum Status { Idle, Loading }` |
| Function return | Explicit for public APIs: `function fetchNotes(): Promise<Note[]>` | Omit only for trivial arrow functions |
| Null handling | `value ?? fallback` | `value \|\| fallback` (unless 0/empty string are falsy intentionally) |
| Type imports | `import type { Note } from './types'` | `import { Note } from './types'` (when only used as type) |

### Type Guard Pattern

```typescript
function isNote(value: unknown): value is Note {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value
  );
}
```

## 2. Naming Conventions

### Files

| Type | Convention | Example |
|------|-----------|---------|
| Component | `PascalCase.tsx` | `NoteCard.tsx`, `QuizPanel.tsx` |
| Hook | `camelCase.ts` with `use` prefix | `useNoteDetail.ts`, `useDebounce.ts` |
| Service | `camelCase.ts` | `noteService.ts`, `aiService.ts` |
| Type definition | `camelCase.ts` | `types.ts`, `note.ts` |
| Utility | `camelCase.ts` | `formatDate.ts`, `logger.ts` |
| Constants | `camelCase.ts` | `config.ts`, `env.ts` |
| Test | `{name}.test.ts(x)` | `NoteCard.test.tsx`, `noteService.test.ts` |
| Index/barrel | `index.ts` | `index.ts` |

### Variables & Functions

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | `NoteCard`, `QuizPanel` |
| Function | camelCase | `fetchNotes`, `handleSubmit` |
| Variable | camelCase | `noteList`, `isLoading` |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_FILE_SIZE` |
| Hook | `use` prefix | `useAuth`, `useDebounce` |
| Event handler | `handle` prefix | `handleClick`, `handleSubmit`, `handleNoteDelete` |
| Boolean | `is/has/should/can` prefix | `isLoading`, `hasError`, `shouldFetch`, `canEdit` |
| Callback prop | `on` prefix | `onClick`, `onChange`, `onNoteSelect` |
| Ref | `Ref` suffix | `inputRef`, `containerRef` |

### CSS / Tailwind

- Use Tailwind utility classes exclusively (no custom CSS unless absolutely necessary)
- CSS custom properties for design tokens: `var(--color-primary-500)`
- CSS class names (when needed): kebab-case: `glass-card`, `nav-gradient-bg`

## 3. File Organization

### Size Limit

**Hard limit: 200 lines per file.** If a component exceeds this:
1. Extract logic into a custom `use{Name}.ts` hook
2. Break the component into sub-components
3. Move constants/configs to separate files

### Import Order

Enforced by ESLint `import/order`:

```typescript
// 1. React core
import { useState, useCallback } from 'react';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { FiEdit, FiTrash } from 'react-icons/fi';

// 3. Shared modules (@shared alias)
import { Button } from '@shared/components/ui';
import { useToast } from '@shared/hooks';
import { logger } from '@shared/lib/logger';

// 4. Feature modules (@features alias)
import { useNoteDetail } from '@features/notes/hooks';

// 5. Relative imports
import { NoteHeader } from './NoteHeader';
import { TAB_ITEMS } from './constants';

// 6. Type-only imports (always last)
import type { Note } from '@shared/types';
import type { NoteDetailProps } from './types';
```

### Barrel Exports

Each feature/component directory has an `index.ts`:

```typescript
// src/features/notes/index.ts
export { NoteCard } from './components/NoteCard';
export { useNoteDetail } from './hooks/useNoteDetail';
export type { Note, NoteData } from './types';
```

## 4. Forbidden Patterns

| Forbidden | Use Instead | Why |
|-----------|------------|-----|
| `console.log()` / `console.error()` | `logger.debug()` / `logger.error()` | Structured logging, environment-aware |
| `alert()` / `confirm()` | `Toast` / `ConfirmModal` component | Consistent UX, non-blocking |
| `document.createElement()` for UI | React components | React paradigm |
| `!important` in CSS | Increase specificity or restructure | Maintainability |
| Inline `style={{ }}` | Tailwind `className` | Consistency |
| `var` declaration | `const` / `let` | Block scoping |
| Non-null assertion `!` | Null check or optional chaining | Safety (allowed with comment explaining why) |
| `// @ts-ignore` | `// @ts-expect-error` with explanation | Better error tracking |
| `process.env.*` | `import from '@shared/lib/env'` | Centralized env access |
| Direct `fetch()` / `axios.create()` | `httpClient` from `@shared/lib` | Unified client with interceptors |
| `setInterval` at module level | Visibility API / event-driven | Prevents background resource waste |

## 5. Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "jsxSingleQuote": false,
  "bracketSameLine": false
}
```

## 6. ESLint Configuration

Key rules (full config in `eslint.config.js`):

```javascript
{
  // TypeScript
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/consistent-type-imports': 'warn',

  // Console & debugging
  'no-console': 'warn',
  'no-debugger': 'error',
  'no-alert': 'error',

  // Import organization
  'import/order': ['warn', {
    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'type'],
    pathGroups: [
      { pattern: 'react', group: 'builtin', position: 'before' },
      { pattern: '@shared/**', group: 'internal', position: 'before' },
      { pattern: '@features/**', group: 'internal', position: 'after' },
    ],
    'newlines-between': 'always',
    alphabetize: { order: 'asc' },
  }],

  // React
  'react-hooks/exhaustive-deps': 'warn',
  'react/self-closing-comp': 'warn',

  // Accessibility
  'jsx-a11y/alt-text': 'error',
  'jsx-a11y/aria-props': 'error',
  'jsx-a11y/click-events-have-key-events': 'warn',
  'jsx-a11y/no-static-element-interactions': 'warn',
  'jsx-a11y/label-has-associated-control': 'warn',
}
```

## 7. Error Handling

### Service Layer

```typescript
export async function fetchNote(id: string): Promise<Note> {
  try {
    const { data } = await httpClient.get<Note>(`/notes/${id}`);
    return data;
  } catch (error) {
    logger.error('Failed to fetch note', error instanceof Error ? error : undefined, { id });
    throw error; // Re-throw for caller to handle
  }
}
```

### Hook Layer

```typescript
function useNote(id: string) {
  const [note, setNote] = useState<Note | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await fetchNote(id);
      setNote(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      showToast({ message: 'Failed to load note', variant: 'error' });
    }
  }, [id, showToast]);

  return { note, error, load };
}
```

### Component Layer

ErrorBoundary as the final safety net — wraps route-level components.
