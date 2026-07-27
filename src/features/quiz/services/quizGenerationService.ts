import { db } from '../../../db/db';
import { generateAiText, parseJsonArray } from '../../../shared/lib/aiClient';
import type { QuizQuestion, Quiz } from '../../../shared/types/quiz';
import { recordQuizLearning } from '../../learning/services/learningMemory';

export async function generateQuiz(noteContent: string): Promise<QuizQuestion[]> {
  const raw = await generateAiText({
    instruction: 'Generate exactly 5 multiple-choice questions from this note. Return only a JSON array. Each item needs question (string), options (four strings), correctAnswer (zero-based numeric index), and explanation (string).',
    input: noteContent,
    temperature: 0.5,
    maxTokens: 2200,
  });
  return parseJsonArray<QuizQuestion>(raw);
}

export async function saveQuizResult(noteId: string | number, questions: QuizQuestion[], userAnswers: number[]): Promise<number> {
  const numericNoteId = typeof noteId === 'string' ? parseInt(noteId, 10) : noteId;
  if (!Number.isFinite(numericNoteId)) throw new Error('A valid note id is required.');
  const score = questions.reduce((total, question, index) => total + (question.correctAnswer === userAnswers[index] ? 1 : 0), 0);
  const id = await db.quizzes.add({ noteId: numericNoteId, questions, userAnswers, date: new Date().toISOString(), score } as Quiz);
  await recordQuizLearning(numericNoteId, score, questions.length);
  return id;
}

export async function getQuizHistory(noteId: string | number): Promise<Quiz[]> {
  const numericNoteId = typeof noteId === 'string' ? parseInt(noteId, 10) : noteId;
  return Number.isFinite(numericNoteId) ? db.quizzes.where({ noteId: numericNoteId }).toArray() : [];
}
