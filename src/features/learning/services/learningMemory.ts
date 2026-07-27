import { db } from '../../../db/db';

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

export async function relatedLearningContext(question: string, excludeContent: string): Promise<string> {
  const related = (await searchLocalNotes(question, 4)).filter((note) => note.content !== excludeContent);
  if (!related.length) return '';
  return related.map((note) => `### ${note.title}\n${note.content.slice(0, 1600)}`).join('\n\n');
}

export async function recordQuizLearning(noteId: number, correct: number, total: number): Promise<void> {
  await db.learningEvents.add({ noteId, kind: 'quiz', score: correct, total, createdAt: new Date().toISOString() });
}
