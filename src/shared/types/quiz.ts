export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id?: number;
  noteId: number;
  questions: QuizQuestion[];
  userAnswers?: number[];
  date: string;
  score?: number;
}

export interface Flashcard {
  id?: number;
  noteId: number;
  front: string;
  back: string;
  syncStatus: 'pending' | 'synced' | 'error';
  date?: string;
}
