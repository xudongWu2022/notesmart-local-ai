export interface Note {
  id?: number;
  title: string;
  content: string;
  date: string;
  subject?: string;
  lastModified: string;
  syncStatus: 'pending' | 'synced' | 'error';
  audioLanguage?: string;
  noteLanguage?: string;
  folderId?: number;
  transcript?: string;
  youtubeUrl?: string;
  attachments?: Attachment[];
  segments?: TranscriptSegment[];
}

export interface NoteData {
  title?: string;
  content: string;
  subject?: string;
  audioLanguage?: string;
  noteLanguage?: string;
  folderId?: number;
  transcript?: string;
  youtubeUrl?: string;
  segments?: TranscriptSegment[];
}

export interface Attachment {
  id?: number;
  noteId: number;
  fileName: string;
  fileType: string;
  fileData: string | ArrayBuffer;
  size: number;
  uploadDate: string;
}

export interface TranscriptSegment {
  text: string;
  timestamp?: number;
  speaker?: string;
}
