import { httpClient } from './httpClient';
import type { Note } from '../types/note';
import type { Flashcard } from '../types/quiz';

export const api = {
  getNoteFromServer: async (noteId: number): Promise<Note> => {
    const { data } = await httpClient.get<Note>(`/notes/${noteId}`);
    return data;
  },

  saveNoteToServer: async (note: Note): Promise<Note> => {
    const { data } = await httpClient.put<Note>(`/notes/${note.id}`, note);
    return data;
  },

  getFlashcardsFromServer: async (noteId: number): Promise<Flashcard[]> => {
    const { data } = await httpClient.get<Flashcard[]>(`/notes/${noteId}/flashcards`);
    return data;
  },

  saveFlashcardsToServer: async (
    noteId: number,
    flashcards: Flashcard[],
  ): Promise<Flashcard[]> => {
    const { data } = await httpClient.put<Flashcard[]>(
      `/notes/${noteId}/flashcards`,
      flashcards,
    );
    return data;
  },
};
