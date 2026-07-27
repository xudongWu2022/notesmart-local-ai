# Git Workflow

## 1. Branch Naming

```
{type}/{short-description}
```

| Type | Usage | Example |
|------|-------|---------|
| `feature/` | New feature | `feature/flashcard-export` |
| `fix/` | Bug fix | `fix/note-save-title-lost` |
| `refactor/` | Code restructuring (no behavior change) | `refactor/split-note-detail` |
| `docs/` | Documentation only | `docs/add-component-standards` |
| `chore/` | Tooling, deps, config | `chore/migrate-to-vite` |
| `test/` | Adding/updating tests | `test/note-service-unit-tests` |

### Rules

- Use kebab-case for descriptions
- Keep branch names short but descriptive
- Delete branches after merge

## 2. Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
{type}: {short description}

{optional body}

{optional footer}
```

### Types

| Type | When to use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add flashcard export to PDF` |
| `fix` | Bug fix | `fix: note title lost on save` |
| `refactor` | Code change with no behavior change | `refactor: extract useNoteDetail hook` |
| `docs` | Documentation | `docs: add API standards` |
| `chore` | Tooling, deps, CI | `chore: upgrade Vite to 6.x` |
| `test` | Tests | `test: add noteService unit tests` |
| `style` | Code style (formatting, no logic change) | `style: apply prettier formatting` |
| `perf` | Performance improvement | `perf: lazy load html2pdf.js` |

### Rules

- Subject line: imperative mood, lowercase, no period, max 72 chars
- Body (optional): explain **why**, not **what** (the diff shows what)
- Footer (optional): `BREAKING CHANGE:` or `Closes #123`

### Good Examples

```
feat: add language selector to transcription panel

Users can now choose their transcription language from a dropdown
with 16 supported languages. The selection persists in localStorage.

Closes #42
```

```
fix: prevent duplicate notes on rapid save clicks

Added debounce to the save handler. Previously, double-clicking
the save button would create two notes with the same content.
```

```
refactor: split Dashboard into sub-components

Dashboard.js was 688 lines. Extracted:
- InputOptionsGrid (input method selection)
- RecentNotesList (note cards with search)
- DocumentUploadModal (file upload flow)
- useDashboard hook (all state + handlers)
```

### Bad Examples

```
# Too vague
fix: fix bug
update: updated stuff

# Not imperative
feat: added new feature
fix: fixes the issue

# Too long
feat: add the ability for users to select their preferred language when starting a new transcription session from the dashboard
```

## 3. Pull Request Requirements

### Before Creating PR

- [ ] Code compiles: `npm run type-check`
- [ ] Linter passes: `npm run lint`
- [ ] Tests pass: `npm run test`
- [ ] Build succeeds: `npm run build`
- [ ] No `console.log` or `alert()` in changed files
- [ ] No API keys or secrets in changed files

### PR Template

```markdown
## Summary

Brief description of what this PR does and why.

## Changes

- Bullet list of specific changes

## Testing

How to verify:
1. Step-by-step instructions
2. Expected behavior

## Screenshots (if UI changes)

Before | After
```

### PR Size

- **Ideal**: < 400 lines changed
- **Maximum**: 800 lines (break larger changes into multiple PRs)
- Exception: automated refactoring (rename, formatting) can be larger

## 4. Forbidden Actions

| Action | Why | What to do instead |
|--------|-----|-------------------|
| `git push --force` to `master` | Destroys others' work | Create a new commit |
| Commit `.env` | Exposes API keys | Use `.env.example` for templates |
| Commit `node_modules/` | Bloats repo | Already in `.gitignore` |
| Commit API keys / secrets | Security breach | Use environment variables |
| Commit large binaries (>1MB) | Bloats repo permanently | Use Git LFS or external storage |
| Amend published commits | Rewrites shared history | Create a new commit |

## 5. .gitignore Essentials

```gitignore
# Dependencies
node_modules/

# Build output
dist/
build/

# Environment (NEVER commit)
.env
.env.local
.env.*.local

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Test coverage
coverage/

# Logs
*.log
npm-debug.log*

# Large binaries
*.pkg
*.dmg
*.exe
```

## 6. Release Workflow (Future)

When CI/CD is established:

```
feature/xxx → PR → master → auto-deploy to staging
                          → manual promote to production
```

### Version Tagging

Use semantic versioning: `v{major}.{minor}.{patch}`

- **major**: Breaking changes
- **minor**: New features (backward compatible)
- **patch**: Bug fixes
