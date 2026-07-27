# Design Tokens

All visual decisions are centralized here. Components reference these tokens (via Tailwind config or CSS variables) — never hardcode raw color/size values.

## 1. Color System

### Primary (Blue)

The main action/brand color. Used for primary buttons, links, active states.

| Token | Hex | Usage |
|-------|-----|-------|
| primary-50 | `#eff6ff` | Backgrounds, hover states |
| primary-100 | `#dbeafe` | Light fills |
| primary-200 | `#bfdbfe` | Borders on active |
| primary-300 | `#93c5fd` | — |
| primary-400 | `#60a5fa` | — |
| **primary-500** | **`#3b82f6`** | **Default primary** |
| primary-600 | `#2563eb` | Hover state |
| primary-700 | `#1d4ed8` | Active/pressed state |
| primary-800 | `#1e40af` | — |
| primary-900 | `#1e3a8a` | — |

### Secondary (Violet)

Accent color for secondary actions, highlights, decorations.

| Token | Hex |
|-------|-----|
| secondary-50 | `#f5f3ff` |
| secondary-100 | `#ede9fe` |
| **secondary-500** | **`#8b5cf6`** |
| secondary-600 | `#7c3aed` |
| secondary-700 | `#6d28d9` |

### Neutral (Gray)

Text, borders, backgrounds. Uses Tailwind's default gray scale.

| Token | Hex | Usage |
|-------|-----|-------|
| neutral-0 | `#ffffff` | White |
| neutral-50 | `#f9fafb` | Page backgrounds (light) |
| neutral-100 | `#f3f4f6` | Card backgrounds, zebra rows |
| neutral-200 | `#e5e7eb` | Borders, dividers |
| neutral-300 | `#d1d5db` | Disabled borders |
| neutral-400 | `#9ca3af` | Placeholder text |
| neutral-500 | `#6b7280` | Secondary text |
| neutral-600 | `#4b5563` | Body text |
| neutral-700 | `#374151` | Headings |
| neutral-800 | `#1f2937` | Dark backgrounds |
| neutral-900 | `#111827` | Primary text (light theme) |
| neutral-950 | `#030712` | Page backgrounds (dark) |

### Semantic Colors

| Intent | 50 | 500 | 600 | Usage |
|--------|-----|-----|-----|-------|
| **Success** | `#f0fdf4` | `#22c55e` | `#16a34a` | Confirmations, success states |
| **Warning** | `#fffbeb` | `#f59e0b` | `#d97706` | Warnings, caution states |
| **Error** | `#fef2f2` | `#ef4444` | `#dc2626` | Errors, destructive actions |
| **Info** | `#eff6ff` | `#3b82f6` | `#2563eb` | Informational messages |

### Surface Colors (Theme-Aware via CSS Variables)

These switch between light and dark mode automatically:

```css
:root {
  --color-surface-bg: #ffffff;
  --color-surface-card: #ffffff;
  --color-surface-card-hover: #f9fafb;
  --color-surface-input: #ffffff;
  --color-surface-sidebar: rgba(255, 255, 255, 0.95);
  --color-surface-overlay: rgba(0, 0, 0, 0.3);
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-text-on-primary: #ffffff;
  --color-border-default: #e5e7eb;
  --color-border-subtle: #f3f4f6;
}

.dark {
  --color-surface-bg: #030712;
  --color-surface-card: #111827;
  --color-surface-card-hover: #1f2937;
  --color-surface-input: #1f2937;
  --color-surface-sidebar: rgba(17, 24, 39, 0.95);
  --color-surface-overlay: rgba(0, 0, 0, 0.5);
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-text-muted: #6b7280;
  --color-text-on-primary: #ffffff;
  --color-border-default: #374151;
  --color-border-subtle: #1f2937;
}
```

**Usage in Tailwind**:
```html
<div className="bg-[var(--color-surface-card)] text-[var(--color-text-primary)]">
```

Or via extended Tailwind config:
```html
<div className="bg-surface-card text-text-primary">
```

## 2. Border Radius

Standardized to 5 levels. No ad-hoc values.

| Token | Value | Tailwind Class | Usage |
|-------|-------|---------------|-------|
| `sm` | 6px | `rounded-sm` | Inputs, small buttons, badges |
| `md` | 8px | `rounded` (default) | Buttons, small cards |
| `lg` | 12px | `rounded-lg` | Cards, modals, panels |
| `xl` | 16px | `rounded-xl` | Feature cards, hero sections |
| `full` | 9999px | `rounded-full` | Avatars, pill buttons, circular buttons |

**Mapping to existing Tailwind classes:**

| Tailwind | Our Token | Use? |
|----------|-----------|------|
| `rounded-sm` | — | No, too small (2px) |
| `rounded` | `sm` (6px) | Remapped |
| `rounded-md` | `md` (8px) | Remapped |
| `rounded-lg` | `lg` (12px) | Yes |
| `rounded-xl` | `xl` (16px) | Yes |
| `rounded-2xl` | — | **Forbidden** — use `xl` |
| `rounded-3xl` | — | **Forbidden** — use `xl` |
| `rounded-full` | `full` | Yes |

## 3. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle edge definition |
| `sm` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Inputs, small cards |
| `md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Cards, dropdowns (default) |
| `lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Modals, floating panels |
| `xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Full-screen overlays |
| `glass` | `0 4px 12px -2px rgb(0 0 0 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.5)` | Glassmorphism cards |
| `card-hover` | `0 12px 24px -8px rgb(0 0 0 / 0.12)` | Card hover elevation |

## 4. Typography

### Font Families

| Token | Value |
|-------|-------|
| `sans` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` |
| `mono` | `'source-code-pro', Menlo, Monaco, Consolas, 'Courier New', monospace` |

### Font Scale

| Token | Size | Line Height | Tailwind |
|-------|------|-------------|----------|
| `xs` | 12px / 0.75rem | 16px / 1rem | `text-xs` |
| `sm` | 14px / 0.875rem | 20px / 1.25rem | `text-sm` |
| `base` | 16px / 1rem | 24px / 1.5rem | `text-base` |
| `lg` | 18px / 1.125rem | 28px / 1.75rem | `text-lg` |
| `xl` | 20px / 1.25rem | 28px / 1.75rem | `text-xl` |
| `2xl` | 24px / 1.5rem | 32px / 2rem | `text-2xl` |
| `3xl` | 30px / 1.875rem | 36px / 2.25rem | `text-3xl` |
| `4xl` | 36px / 2.25rem | 40px / 2.5rem | `text-4xl` |

### Font Weights

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `normal` | 400 | `font-normal` | Body text |
| `medium` | 500 | `font-medium` | Labels, emphasis |
| `semibold` | 600 | `font-semibold` | Subheadings, buttons |
| `bold` | 700 | `font-bold` | Headings |

## 5. Spacing

Use Tailwind's default 4px-based spacing scale. No custom spacing tokens.

| Value | Tailwind | Common usage |
|-------|----------|-------------|
| 4px | `p-1` / `gap-1` | Tight spacing |
| 8px | `p-2` / `gap-2` | Compact elements |
| 12px | `p-3` / `gap-3` | Between related items |
| 16px | `p-4` / `gap-4` | Standard padding (default) |
| 20px | `p-5` / `gap-5` | Comfortable spacing |
| 24px | `p-6` / `gap-6` | Section padding |
| 32px | `p-8` / `gap-8` | Large sections |
| 48px | `p-12` | Page margins |

## 6. Animations & Transitions

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `fast` | 100ms | Micro-interactions (button press, checkbox toggle) |
| `normal` | 200ms | Standard transitions (hover, color change) |
| `slow` | 300ms | Modal/panel enter/exit |
| `slower` | 500ms | Page-level fade-in |

### Easing

| Token | Value | Usage |
|-------|-------|-------|
| `default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard ease-in-out |
| `in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting |
| `out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful bounce |

### Framer Motion Presets

```typescript
// Standardized motion presets — import from @shared/lib/motion
export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },
  listItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  },
  listContainer: {
    animate: { transition: { staggerChildren: 0.05 } },
  },
};
```

### Rules

1. **Only animate `transform` and `opacity`** — GPU-accelerated, no layout thrashing
2. **Respect `prefers-reduced-motion`**: disable or reduce animations
3. **Max duration 500ms** — nothing should feel sluggish
4. **Purpose-driven**: every animation must serve a purpose (guide attention, show state change, spatial orientation)

## 7. Icons

### Library: `react-icons/fi` (Feather Icons)

Single icon library for the entire project. No mixing.

### Sizes

| Token | Size | Tailwind | Usage |
|-------|------|----------|-------|
| `sm` | 16px | `w-4 h-4` | Inline with text, badges |
| `md` | 20px | `w-5 h-5` | Default — buttons, nav items |
| `lg` | 24px | `w-6 h-6` | Headers, empty states |

### Accessibility

```tsx
// Decorative icon (alongside text)
<FiEdit className="w-5 h-5" aria-hidden="true" />
<span>Edit Note</span>

// Functional icon (standalone — must have label)
<IconButton icon={FiTrash} aria-label="Delete note" variant="ghost" />
```

### Common Icon Mapping

| Usage | Icon |
|-------|------|
| Edit | `FiEdit` / `FiEdit2` |
| Delete | `FiTrash` / `FiTrash2` |
| Close | `FiX` |
| Search | `FiSearch` |
| Settings | `FiSettings` |
| Add/Create | `FiPlus` |
| Back | `FiArrowLeft` |
| Menu | `FiMenu` |
| Folder | `FiFolder` |
| File/Note | `FiFileText` |
| Mic | `FiMic` |
| Upload | `FiUpload` |
| Download | `FiDownload` |
| Star/Favorite | `FiStar` |
| Check | `FiCheck` |
| Info | `FiInfo` |
| Warning | `FiAlertTriangle` |
| Error | `FiAlertCircle` |
| Chevron | `FiChevronRight` / `FiChevronDown` |
| External link | `FiExternalLink` |
| Copy | `FiCopy` |
| Eye (view) | `FiEye` |
| Play/Pause | `FiPlay` / `FiPause` |
| Stop | `FiSquare` |

## 8. Tailwind Config Integration

```javascript
// tailwind.config.js — theme extension
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe',
          300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6',
          600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
        },
        secondary: {
          50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe',
          300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6',
          600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95',
        },
        surface: {
          bg: 'var(--color-surface-bg)',
          card: 'var(--color-surface-card)',
          'card-hover': 'var(--color-surface-card-hover)',
          input: 'var(--color-surface-input)',
          sidebar: 'var(--color-surface-sidebar)',
          overlay: 'var(--color-surface-overlay)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border-default)',
          subtle: 'var(--color-border-subtle)',
        },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        glass: '0 4px 12px -2px rgb(0 0 0 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.5)',
        'card-hover': '0 12px 24px -8px rgb(0 0 0 / 0.12)',
      },
    },
  },
};
```
