# Component Standards

## 1. Component Layers (Atomic Design)

```
src/shared/components/
  ui/              Atoms & Molecules — Design system primitives
  layout/          Organisms — Page-level layout (Sidebar, Navbar, PageContainer)

src/features/{feature}/
  components/      Business components specific to that feature

src/app/
  (pages via routes.tsx)   Page-level orchestrators ("thin shells")
```

### Layer Responsibilities

| Layer | Knows about business logic? | Example |
|-------|-----------------------------|---------|
| **ui/** | No — pure presentational | `Button`, `Modal`, `Toast`, `Tabs` |
| **layout/** | Minimal — layout concerns only | `Sidebar`, `Navbar`, `PageContainer` |
| **features/*/components/** | Yes — feature-specific | `NoteCard`, `QuizPanel`, `FlashcardPanel` |
| **pages** (routes) | Orchestration only | `Dashboard`, `NoteDetail` |

## 2. Props API Standard

### Template

```typescript
interface ComponentNameProps {
  // --- Variants ---
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';

  // --- State ---
  disabled?: boolean;
  loading?: boolean;

  // --- Content ---
  children: React.ReactNode;

  // --- Style extension ---
  className?: string;

  // --- Events ---
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
```

### Rules

1. **`variant` + `size`** are the standard control dimensions for visual components
2. **Always accept `className`** — allows consumers to extend styling
3. **Use `React.forwardRef`** for components that wrap native elements (inputs, buttons)
4. **Default values** in destructuring, not `defaultProps`:
   ```typescript
   function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) { }
   ```
5. **Children over render props** — prefer composition:
   ```tsx
   // Good
   <Card><Card.Header>Title</Card.Header></Card>
   // Avoid
   <Card renderHeader={() => <span>Title</span>} />
   ```

### Compound Component Pattern

For complex components (Card, Modal, Tabs), use compound components:

```tsx
// Definition
const Card = ({ children, className }: CardProps) => (
  <div className={cn('rounded-lg border shadow-sm', className)}>{children}</div>
);
Card.Header = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-3 border-b">{children}</div>
);
Card.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-4">{children}</div>
);
Card.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-3 border-t">{children}</div>
);

// Usage
<Card>
  <Card.Header>Note Title</Card.Header>
  <Card.Body>Content here</Card.Body>
  <Card.Footer><Badge>3 min ago</Badge></Card.Footer>
</Card>
```

## 3. Component File Structure

```
Button/
  Button.tsx          # Component implementation
  Button.test.tsx     # Tests
  index.ts            # export { Button } from './Button'
```

For simple components (< 50 lines), a single file is fine:
```
ui/
  Spinner.tsx         # Small enough for single file
  Divider.tsx
```

## 4. State Patterns

### Extract Logic to Hooks

Page components should be **thin orchestrators**. All business logic lives in hooks:

```typescript
// hooks/useNoteDetail.ts — ALL logic here
export function useNoteDetail(noteId: string) {
  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { showToast } = useToast();

  const handleSave = useCallback(async (content: string) => { ... }, []);
  const handleDelete = useCallback(async () => { ... }, []);
  const handleExport = useCallback(async () => { ... }, []);

  return { note, isEditing, handleSave, handleDelete, handleExport };
}

// pages/NoteDetail.tsx — THIN SHELL
function NoteDetail() {
  const { noteId } = useParams<{ noteId: string }>();
  const { note, isEditing, handleSave, handleDelete, handleExport } = useNoteDetail(noteId!);

  return (
    <PageContainer>
      <NoteHeader note={note} onEdit={...} onExport={handleExport} />
      <NoteTabBar />
      <NoteContent note={note} isEditing={isEditing} onSave={handleSave} />
    </PageContainer>
  );
}
```

### Controlled Components First

```typescript
// Controlled (preferred)
<Input value={name} onChange={setName} />

// Uncontrolled (only when necessary, e.g., file inputs)
<input ref={fileInputRef} type="file" />
```

## 5. Accessibility Standards

### Mandatory Requirements

| Element | Requirement |
|---------|-------------|
| `<img>` | Must have `alt` attribute |
| Icon-only button | Must have `aria-label` |
| Form input | Must have associated `<label>` or `aria-label` |
| Modal/Dialog | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Loading state | Container: `aria-busy="true"` |
| Error message | `role="alert"` or `aria-live="assertive"` |
| Status update | `aria-live="polite"` |
| Interactive `<div>` | Add `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space) |

### Focus Management

```typescript
// Modal: trap focus, return on close
<Dialog open={isOpen} onClose={handleClose} initialFocus={cancelButtonRef}>
  ...
</Dialog>

// Focus ring (global base style)
// Applied via Tailwind: focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
```

### Keyboard Navigation

| Component | Keys |
|-----------|------|
| Modal | `Escape` → close, `Tab` / `Shift+Tab` → cycle focus |
| Dropdown | `Enter`/`Space` → open, `Arrow` → navigate, `Escape` → close |
| Tabs | `ArrowLeft`/`ArrowRight` → switch tab |
| Toast | Auto-dismiss pauses on hover/focus |

### Don'ts

- Never use `outline: none` without providing an alternative focus indicator
- Never make `<div>` clickable without keyboard support
- Never auto-focus elements that disrupt the reading flow

## 6. Design System Component List

### Must-Have — Atoms

| Component | Props | Notes |
|-----------|-------|-------|
| **Button** | `variant`, `size`, `disabled`, `loading`, `leftIcon`, `rightIcon`, `fullWidth` | Primary interactive element |
| **IconButton** | `icon`, `variant`, `size`, `aria-label` (required) | Icon-only buttons |
| **Input** | `label`, `error`, `hint`, `leftAddon`, `rightAddon`, `size` | Text input |
| **Select** | `label`, `options`, `error`, `placeholder` | Dropdown select |
| **Textarea** | `label`, `error`, `hint`, `resize`, `rows`, `maxLength` | Multi-line input |
| **Checkbox** | `label`, `checked`, `indeterminate`, `disabled` | Checkbox |
| **Switch** | `label`, `checked`, `disabled`, `size` | Toggle switch |
| **Label** | `htmlFor`, `required` | Form label |
| **Badge** | `variant`, `size`, `dot` | Status indicators |
| **Spinner** | `size`, `label` | Loading indicator |
| **Divider** | `orientation` | Visual separator |

### Must-Have — Molecules

| Component | Props | Notes |
|-----------|-------|-------|
| **Modal** | `open`, `onClose`, `size`, `initialFocusRef` | Unified — replaces current Modal + ConfirmDialog + ConfirmModal |
| **ConfirmModal** | `open`, `onClose`, `onConfirm`, `title`, `message`, `confirmVariant` | Composed from Modal |
| **Toast** | `message`, `variant`, `duration`, `action` | Notification |
| **ToastProvider** | `children`, `position` | Toast container |
| **DropdownMenu** | `trigger`, `items`, `align` | Context/action menus |
| **Tabs** | `defaultValue`, `value`, `onChange` | Tab navigation |
| **Card** | `variant`, `hoverable`, `clickable` | Compound: Card.Header, Card.Body, Card.Footer |
| **Skeleton** | `variant`, `width`, `height`, `count` | Loading placeholder |
| **EmptyState** | `icon`, `title`, `message`, `action` | Empty data display |
| **ErrorState** | `title`, `message`, `retry` | Error display with retry |
| **SearchInput** | `value`, `onChange`, `onClear`, `loading` | Search with clear button |
| **FormField** | `label`, `error`, `hint`, `required`, `children` | Form field wrapper |
| **ProgressBar** | `value`, `max`, `label`, `variant` | Progress indicator |

### Nice-to-Have

| Component | Notes |
|-----------|-------|
| **Avatar** | User avatar with fallback |
| **Tooltip** | Hover/focus tooltip |
| **AlertModal** | Info/warning/error alert dialog |
| **VisuallyHidden** | Screen-reader-only content |
| **SkipNavLink** | Skip to main content link |

## 7. Component Implementation Checklist

Before shipping any component, verify:

- [ ] Props interface defined with TypeScript
- [ ] Default `variant` and `size` set
- [ ] Accepts `className` for style extension
- [ ] Uses `React.forwardRef` if wrapping native element
- [ ] All interactive elements have keyboard support
- [ ] ARIA attributes present (label, role, states)
- [ ] Focus ring visible (`focus-visible:ring-2`)
- [ ] Works in both light and dark theme
- [ ] File under 200 lines
- [ ] Exported via `index.ts`
