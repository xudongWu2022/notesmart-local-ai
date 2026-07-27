import { db, type MemoryChunk, type StudyCardProgress } from '../../../db/db';

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'what', 'how', 'are', 'was', 'you', 'your', '的', '了', '是', '在', '我', '和']);

function terms(value: string): string[] {
  return [...new Set((value.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? []).filter((term) => !STOP_WORDS.has(term)))].slice(0, 20);
}

export async function searchLocalNotes(query: string, limit = 30) {
  const queryTerms = terms(query);
  const notes = await db.notes.toArray();
  if (!queryTerms.length) return notes.sort((a, b) => +new Date(b.lastModified) - +new Date(a.lastModified)).slice(0, limit);

  return notes
    .map((note) => {
      const title = (note.title ?? '').toLowerCase();
      const body = `${note.content ?? ''} ${note.transcript ?? ''}`.toLowerCase();
      const score = queryTerms.reduce((total, term) => total + (title.includes(term) ? 5 : 0) + (body.includes(term) ? 1 : 0), 0);
      return { note, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || +new Date(b.note.lastModified) - +new Date(a.note.lastModified))
    .slice(0, limit)
    .map(({ note }) => note);
}

export async function indexNoteForMemory(noteId: number): Promise<void> {
  const note = await db.notes.get(noteId);
  if (!note) return;
  const source = `${note.title}\n${note.content}\n${note.transcript ?? ''}`.trim();
  const chunks = source.match(/[\s\S]{1,1200}(?:\s|$)/g) ?? [source];
  await db.transaction('rw', db.memoryChunks, async () => {
    await db.memoryChunks.where('noteId').equals(noteId).delete();
    await db.memoryChunks.bulkAdd(chunks.filter(Boolean).map((text) => ({
      noteId, title: note.title, text, tokens: terms(text).join(' '), updatedAt: note.lastModified,
    } satisfies Omit<MemoryChunk, 'id'>)));
  });
}

export async function relatedLearningContext(question: string, excludeContent: string): Promise<string> {
  const allNotes = await db.notes.toArray();
  await Promise.all(allNotes.filter((note) => note.id != null).map((note) => indexNoteForMemory(note.id!)));
  const queryTerms = terms(question);
  const chunks = await db.memoryChunks.toArray();
  const related = chunks
    .filter((chunk) => !excludeContent.includes(chunk.text))
    .map((chunk) => ({ chunk, score: queryTerms.reduce((score, term) => score + (chunk.tokens.includes(term) ? 1 : 0), 0) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ chunk }) => `### ${chunk.title}\n${chunk.text}`);
  return related.join('\n\n');
}

export async function recordQuizLearning(noteId: number, correct: number, total: number): Promise<void> {
  await db.learningEvents.add({ noteId, kind: 'quiz', score: correct, total, createdAt: new Date().toISOString() });
}

export async function recordFlashcardReview(noteId: number, cardId: string | number, remembered: boolean): Promise<void> {
  const key = String(cardId);
  const existing = await db.studyCardProgress.where('[noteId+cardId]').equals([noteId, key]).first();
  const mastery = Math.max(0, Math.min(5, (existing?.mastery ?? 0) + (remembered ? 1 : -1)));
  const intervalDays = remembered ? Math.max(1, Math.min(30, (existing?.intervalDays ?? 1) * 2)) : 1;
  const nextReview = new Date(Date.now() + intervalDays * 86400000).toISOString();
  const progress: StudyCardProgress = { noteId, cardId: key, mastery, intervalDays, nextReview, lastReviewed: new Date().toISOString() };
  if (existing?.id != null) await db.studyCardProgress.update(existing.id, progress);
  else await db.studyCardProgress.add(progress);
  await db.learningEvents.add({ noteId, kind: 'flashcard', score: remembered ? 1 : 0, total: 1, createdAt: new Date().toISOString() });
}

export async function getDailyReviewPlan(limit = 12) {
  const now = new Date().toISOString();
  const due = await db.studyCardProgress.where('nextReview').belowOrEqual(now).sortBy('nextReview');
  return due.slice(0, limit);
}
