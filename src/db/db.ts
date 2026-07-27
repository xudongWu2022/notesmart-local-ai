import Dexie from 'dexie';
import { api } from '../shared/lib/api';
import { CONFIG } from '../shared/lib/config';
import type { Note, NoteData, Attachment } from '../shared/types/note';
import type { Quiz } from '../shared/types/quiz';
import type { Folder } from '../shared/types/folder';

interface SyncQueueItem {
  id?: number;
  operation: string;
  data: unknown;
  timestamp: string;
  attempts?: number;
  lastError?: string;
}

export interface MemoryChunk {
  id?: number;
  noteId: number;
  title: string;
  text: string;
  tokens: string;
  updatedAt: string;
}

export interface StudyCardProgress {
  id?: number;
  noteId: number;
  cardId: string;
  mastery: number;
  intervalDays: number;
  nextReview: string;
  lastReviewed?: string;
}

interface SyncConflict {
  id?: number;
  noteId: number;
  local: Note;
  server: Note;
  createdAt: string;
}

export interface LearningEvent {
  id?: number;
  noteId: number;
  kind: 'quiz' | 'flashcard';
  score?: number;
  total?: number;
  createdAt: string;
}

class NotesAppDatabase extends Dexie {
  notes!: Dexie.Table<Note, number>;
  attachments!: Dexie.Table<Attachment, number>;
  folders!: Dexie.Table<Folder, number>;
  flashcards!: Dexie.Table<unknown, number>;
  syncQueue!: Dexie.Table<SyncQueueItem, number>;
  quizzes!: Dexie.Table<Quiz, number>;
  learningEvents!: Dexie.Table<LearningEvent, number>;
  memoryChunks!: Dexie.Table<MemoryChunk, number>;
  studyCardProgress!: Dexie.Table<StudyCardProgress, number>;
  conflicts!: Dexie.Table<SyncConflict, number>;

  constructor() {
    super('notesApp');
    this.version(5).stores({
      notes:
        '++id, title, content, date, subject, lastModified, syncStatus, audioLanguage, noteLanguage, folderId, transcript, youtubeUrl, attachments, segments',
      attachments: '++id, noteId, fileName, fileType, fileData, size, uploadDate',
      folders: '++id, name, createdAt, lastModified, syncStatus',
      flashcards: '++id, noteId, front, back, syncStatus',
      syncQueue: '++id, operation, data, timestamp',
      quizzes: '++id, noteId, questions, userAnswers, date, score',
    });
    this.version(6).stores({
      notes:
        '++id, title, content, date, subject, lastModified, syncStatus, audioLanguage, noteLanguage, folderId, transcript, youtubeUrl, attachments, segments',
      attachments: '++id, noteId, fileName, fileType, fileData, size, uploadDate',
      folders: '++id, name, createdAt, lastModified, syncStatus',
      flashcards: '++id, noteId, front, back, syncStatus',
      syncQueue: '++id, operation, data, timestamp',
      quizzes: '++id, noteId, questions, userAnswers, date, score',
      learningEvents: '++id, noteId, kind, createdAt',
    });
    this.version(7).stores({
      notes: '++id, title, content, date, subject, lastModified, syncStatus, folderId',
      attachments: '++id, noteId, fileName, fileType, uploadDate',
      folders: '++id, name, createdAt, lastModified, syncStatus',
      flashcards: '++id, noteId, date',
      syncQueue: '++id, operation, timestamp',
      quizzes: '++id, noteId, date, score',
      learningEvents: '++id, noteId, kind, createdAt',
      memoryChunks: '++id, noteId, updatedAt',
      studyCardProgress: '++id, [noteId+cardId], nextReview',
      conflicts: '++id, noteId, createdAt',
    });
  }
}

export const db = new NotesAppDatabase();

async function queueNoteSync(note: Note): Promise<void> {
  const queued = await db.syncQueue.filter((item) => item.operation === 'saveNote' && (item.data as Note).id === note.id).first();
  const entry = { operation: 'saveNote', data: note, timestamp: new Date().toISOString(), attempts: 0 };
  if (queued?.id != null) await db.syncQueue.update(queued.id, entry);
  else await db.syncQueue.add(entry);
}

async function syncNote(note: Note): Promise<void> {
  try {
    await api.saveNoteToServer(note);
    if (note.id != null) await db.notes.update(note.id, { syncStatus: 'synced' });
  } catch (error: unknown) {
    const response = (error as { response?: { status?: number; data?: Note } }).response;
    if (response?.status === 409 && note.id != null && response.data) {
      await db.conflicts.add({ noteId: note.id, local: note, server: response.data, createdAt: new Date().toISOString() });
      await db.notes.put({ ...note, id: undefined, title: `${note.title} (local conflict copy)`, syncStatus: 'pending', lastModified: new Date().toISOString() });
      await db.notes.put({ ...response.data, syncStatus: 'synced' });
      return;
    }
    throw error;
  }
}

export const saveNote = async (noteData: NoteData): Promise<number> => {
  try {
    const note: Note = {
      ...noteData,
      title: noteData.title ?? '',
      segments: noteData.segments ?? [],
      date: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      syncStatus: 'pending',
    };

    const id = await db.notes.put(note);

    if (!CONFIG.SYNC_ENABLED) {
      await db.notes.update(id, { syncStatus: 'synced' });
    } else try {
      await syncNote({ ...note, id });
    } catch {
      await queueNoteSync({ ...note, id });
    }

    return id;
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
};

export const getNote = async (id: number): Promise<Note | undefined> => {
  try {
    const localNote = await db.notes.get(id);

    if (!CONFIG.SYNC_ENABLED) return localNote;

    try {
      const serverNote = await api.getNoteFromServer(id);
      if (serverNote.lastModified > (localNote?.lastModified ?? '')) {
        await db.notes.put({
          ...serverNote,
          syncStatus: 'synced',
        });
        return serverNote;
      }
    } catch {
      console.warn('Could not fetch from server, using local data');
    }

    return localNote;
  } catch (error) {
    console.error('Error getting note:', error);
    throw error;
  }
};

export const processSyncQueue = async (): Promise<void> => {
  if (!CONFIG.SYNC_ENABLED) return;
  const queue = await db.syncQueue.toArray();

  for (const item of queue) {
    try {
      switch (item.operation) {
        case 'saveNote':
          await syncNote(item.data as Note);
          break;
        case 'saveFlashcards': {
          const data = item.data as { noteId: number; flashcards: unknown[] };
          await api.saveFlashcardsToServer(data.noteId, data.flashcards as never[]);
          break;
        }
        default:
          console.warn('Unknown operation:', item.operation);
          break;
      }
      if (item.id != null) await db.syncQueue.delete(item.id);
    } catch (error) {
      if (item.id != null) await db.syncQueue.update(item.id, { attempts: (item.attempts ?? 0) + 1, lastError: error instanceof Error ? error.message : 'Sync failed' });
      console.error('Sync failed for item:', item, error);
    }
  }
};

// Process sync queue when the page becomes visible (instead of polling with setInterval)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      processSyncQueue();
    }
  });
}
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { void processSyncQueue(); });
}

export const updateNote = async (id: number, updates: Partial<Note>): Promise<void> => {
  try {
    await db.notes.update(id, {
      ...updates,
      lastModified: new Date().toISOString(),
      syncStatus: CONFIG.SYNC_ENABLED ? 'pending' : 'synced',
    });

    if (!CONFIG.SYNC_ENABLED) return;

    try {
      const updatedNote = await db.notes.get(id);
      if (updatedNote) {
        await syncNote(updatedNote);
      }
    } catch {
      const noteData = await db.notes.get(id);
      if (noteData) await queueNoteSync(noteData);
    }
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export const saveAttachment = async (noteId: number, file: File): Promise<number> => {
  try {
    const fileData = await file.arrayBuffer();

    const attachment: Omit<Attachment, 'id'> = {
      noteId,
      fileName: file.name,
      fileType: file.type,
      fileData,
      size: file.size,
      uploadDate: new Date().toISOString(),
    };

    const attachmentId = await db.attachments.add(attachment as Attachment);
    return attachmentId;
  } catch (error) {
    console.error('Error saving attachment:', error);
    throw error;
  }
};

export const getAttachment = async (
  attachmentId: number,
): Promise<(Attachment & { blob: Blob }) | undefined> => {
  try {
    const attachment = await db.attachments.get(attachmentId);
    if (!attachment) throw new Error('Attachment not found');

    const blob = new Blob([attachment.fileData as ArrayBuffer], { type: attachment.fileType });
    return {
      ...attachment,
      blob,
    };
  } catch (error) {
    console.error('Error getting attachment:', error);
    throw error;
  }
};

export const deleteAttachment = async (attachmentId: number, noteId: number): Promise<void> => {
  try {
    await db.attachments.delete(attachmentId);
  } catch (error) {
    console.error('Error deleting attachment:', error);
    throw error;
  }
};
