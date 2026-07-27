# API Standards

## 1. HTTP Client

### Single Axios Instance

All API calls go through a single shared HTTP client:

```typescript
// shared/lib/httpClient.ts
import axios from 'axios';
import { env } from './env';
import { logger } from './logger';

export const httpClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Auth token injection
httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unified error handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    logger.error('API request failed', error, {
      url: error.config?.url,
      status: error.response?.status,
    });
    return Promise.reject(error);
  },
);
```

### Rules

| Rule | Reason |
|------|--------|
| Never use raw `fetch()` | No interceptors, no unified error handling |
| Never create standalone `axios.create()` in services | Bypasses auth & error interceptors |
| Never hardcode API URLs in service files | Centralize in `config.ts` |
| Never put API keys in frontend code | Proxy through backend |

## 2. API URL Configuration

```typescript
// shared/lib/config.ts
import { env } from './env';

export const API_ROUTES = {
  // Notes
  notes: '/api/notes',
  noteById: (id: string) => `/api/notes/${id}`,
  noteFlashcards: (id: string) => `/api/notes/${id}/flashcards`,

  // Folders
  folders: '/api/folders',
  folderById: (id: string) => `/api/folders/${id}`,

  // AI (proxied through backend)
  aiChat: '/api/ai/chat',
  aiGenerateNotes: '/api/ai/generate-notes',
  aiGenerateQuiz: '/api/ai/generate-quiz',
  aiGenerateFlashcards: '/api/ai/generate-flashcards',

  // Transcription (proxied through backend)
  transcribe: '/api/transcription/transcribe',
  transcribeStream: '/api/transcription/stream',

  // YouTube (proxied through backend)
  youtubeTranscript: '/api/youtube/transcript',

  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',

  // Videos
  videos: '/api/videos',
  videoById: (id: string) => `/api/videos/${id}`,
  videoUpload: '/api/videos/upload',
} as const;
```

## 3. Service Function Pattern

### Naming Convention

`{verb}{Noun}` — verb describes the action, noun describes the resource:

| Pattern | Examples |
|---------|----------|
| `fetch{Resource}` | `fetchNotes()`, `fetchNoteById(id)` |
| `create{Resource}` | `createNote(data)`, `createFolder(name)` |
| `update{Resource}` | `updateNote(id, data)` |
| `delete{Resource}` | `deleteNote(id)`, `deleteFolder(id)` |
| `generate{Resource}` | `generateQuiz(noteId)`, `generateFlashcards(noteId)` |
| `upload{Resource}` | `uploadVideo(file)`, `uploadAudio(file)` |

### Template

```typescript
// features/notes/services/noteService.ts
import { httpClient } from '@shared/lib/httpClient';
import { API_ROUTES } from '@shared/lib/config';
import { logger } from '@shared/lib/logger';

import type { Note, CreateNoteData } from '../types';

export async function fetchNotes(): Promise<Note[]> {
  const { data } = await httpClient.get<Note[]>(API_ROUTES.notes);
  return data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const { data } = await httpClient.get<Note>(API_ROUTES.noteById(id));
  return data;
}

export async function createNote(noteData: CreateNoteData): Promise<Note> {
  const { data } = await httpClient.post<Note>(API_ROUTES.notes, noteData);
  return data;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const { data } = await httpClient.put<Note>(API_ROUTES.noteById(id), updates);
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  await httpClient.delete(API_ROUTES.noteById(id));
}
```

### Rules

1. **Typed parameters and return values** — always explicit
2. **No try-catch in simple services** — let the httpClient interceptor handle logging; hooks catch errors
3. **Add try-catch only for complex flows** that need custom error handling or fallback logic:
   ```typescript
   export async function generateNotes(transcript: string, language: string): Promise<Note> {
     try {
       const { data } = await httpClient.post<Note>(API_ROUTES.aiGenerateNotes, {
         transcript,
         language,
       });
       return data;
     } catch (error) {
       logger.error('Note generation failed', error instanceof Error ? error : undefined, {
         language,
         transcriptLength: transcript.length,
       });
       throw error;
     }
   }
   ```

## 4. Error Handling Layers

```
┌──────────────────────────────────────────────────┐
│ Layer 3: ErrorBoundary                            │
│ Catches: Uncaught render errors                   │
│ Action: Show fallback UI with retry button        │
├──────────────────────────────────────────────────┤
│ Layer 2: Hook (useNoteDetail, useDashboard)       │
│ Catches: Service errors                           │
│ Action: Set error state, show Toast notification  │
├──────────────────────────────────────────────────┤
│ Layer 1: httpClient interceptor                   │
│ Catches: All HTTP errors                          │
│ Action: Log via logger, handle 401 (auto-logout)  │
├──────────────────────────────────────────────────┤
│ Layer 0: Service function                         │
│ Catches: Complex flows only (with custom logic)   │
│ Action: Log context, re-throw                     │
└──────────────────────────────────────────────────┘
```

### HTTP Status Handling

| Status | Handled by | Action |
|--------|-----------|--------|
| 401 Unauthorized | httpClient interceptor | Auto-logout, redirect to `/login` |
| 403 Forbidden | Hook layer | Toast: "Permission denied" |
| 404 Not Found | Hook layer | Show EmptyState or redirect |
| 429 Too Many Requests | Hook layer | Toast: "Rate limited, try again later" |
| 500+ Server Error | httpClient interceptor + Hook | Log error + Toast: "Something went wrong" |
| Network Error | httpClient interceptor + Hook | Toast: "No internet connection" |

## 5. Streaming API Pattern

For AI-powered features that stream responses (note generation, AI chat):

```typescript
export async function streamAiChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
): Promise<void> {
  try {
    const response = await fetch(`${env.apiUrl}${API_ROUTES.aiChat}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${useAuthStore.getState().token}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      onChunk(text);
    }

    onDone();
  } catch (error) {
    logger.error('AI chat stream failed', error instanceof Error ? error : undefined);
    onError(error instanceof Error ? error : new Error('Stream failed'));
  }
}
```

**Note**: Streaming uses raw `fetch` (not httpClient) because axios doesn't support ReadableStream natively. This is the one exception to the "no fetch" rule.

## 6. File Upload Pattern

```typescript
export async function uploadAudio(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await httpClient.post<TranscriptionResult>(
    API_ROUTES.transcribe,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    },
  );

  return data;
}
```

## 7. Local-First with Dexie

For offline-first operations, services interact with Dexie first, then sync:

```typescript
// db/operations.ts
export async function saveNote(note: NoteData): Promise<number> {
  const id = await db.notes.put({
    ...note,
    lastModified: new Date().toISOString(),
    syncStatus: 'pending',
  });

  await db.syncQueue.add({
    operation: 'upsert',
    table: 'notes',
    data: { ...note, id },
    timestamp: Date.now(),
  });

  return id;
}
```

**Rule**: Only ONE `saveNote` function exists in `db/operations.ts`. No duplicates in service files.

## 8. Logger Service

```typescript
// shared/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = import.meta.env.PROD ? 'warn' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

export const logger = {
  debug(message: string, data?: unknown) {
    if (shouldLog('debug')) console.debug(`[DEBUG] ${message}`, data ?? '');
  },
  info(message: string, data?: unknown) {
    if (shouldLog('info')) console.info(`[INFO] ${message}`, data ?? '');
  },
  warn(message: string, data?: unknown) {
    if (shouldLog('warn')) console.warn(`[WARN] ${message}`, data ?? '');
  },
  error(message: string, error?: Error, data?: unknown) {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error ?? '', data ?? '');
      // Future: send to error reporting service (Sentry, etc.)
    }
  },
};
```

**Rule**: All logging goes through this service. Direct `console.*` calls are flagged by ESLint.
