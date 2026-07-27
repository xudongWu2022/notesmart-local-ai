import { db } from '../../../db/db';
import { generateAiText, parseJsonArray } from '../../../shared/lib/aiClient';

export interface GeneratedFlashcard {
  id: number;
  front: string;
  back: string;
}

export interface FlashcardRecord {
  id?: number;
  noteId: number;
  flashcards: GeneratedFlashcard[];
  date: string;
}

export async function generateFlashcards(noteContent: string): Promise<GeneratedFlashcard[]> {
  const raw = await generateAiText({
    instruction: 'Generate exactly 5 high-value flashcards from this note. Return only a JSON array. Every item must have numeric id, string front, and string back.',
    input: noteContent,
    temperature: 0.5,
    maxTokens: 2000,
  });
  return parseJsonArray<GeneratedFlashcard>(raw);
}

export async function saveFlashcards(noteId: string | number, flashcards: GeneratedFlashcard[]): Promise<FlashcardRecord> {
  const record: FlashcardRecord = {
    noteId: typeof noteId === 'string' ? parseInt(noteId, 10) : noteId,
    flashcards,
    date: new Date().toISOString(),
  };
  await db.flashcards.add(record as never);
  return record;
}

export async function getFlashcardHistory(noteId: string | number): Promise<FlashcardRecord[]> {
  const numericNoteId = typeof noteId === 'string' ? parseInt(noteId, 10) : noteId;
  const history = await db.flashcards.where('noteId').equals(numericNoteId).toArray() as FlashcardRecord[];
  return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function deleteFlashcard(noteId: string | number, cardId: number): Promise<void> {
  const mostRecent = (await getFlashcardHistory(noteId))[0];
  if (mostRecent?.id != null) {
    await db.flashcards.update(mostRecent.id, { flashcards: mostRecent.flashcards.filter((card) => card.id !== cardId) });
  }
}
