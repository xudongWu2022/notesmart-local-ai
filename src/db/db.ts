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
  }
}

export const db = new NotesAppDatabase();

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
      await api.saveNoteToServer({ ...note, id });
      await db.notes.update(id, { syncStatus: 'synced' });
    } catch {
      await db.syncQueue.add({
        operation: 'saveNote',
        data: note,
        timestamp: new Date().toISOString(),
      });
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
          await api.saveNoteToServer(item.data as Note);
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
      if (item.id != null) {
        await db.syncQueue.delete(item.id);
      }
    } catch (error) {
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
        await api.saveNoteToServer(updatedNote);
        await db.notes.update(id, { syncStatus: 'synced' });
      }
    } catch {
      const noteData = await db.notes.get(id);
      await db.syncQueue.add({
        operation: 'saveNote',
        data: noteData,
        timestamp: new Date().toISOString(),
      });
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
