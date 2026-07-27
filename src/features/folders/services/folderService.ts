import { httpClient } from '../../../shared/lib/httpClient';
import type { Folder } from '../../../shared/types/folder';

export const folderService = {
  getFolder: async (id: number): Promise<Folder> => {
    const { data } = await httpClient.get<Folder>(`/folders/${id}`);
    return data;
  },

  updateFolder: async (id: number, updates: Partial<Folder>): Promise<Folder> => {
    const { data } = await httpClient.put<Folder>(`/folders/${id}`, updates);
    return data;
  },

  deleteFolder: async (id: number): Promise<void> => {
    await httpClient.delete(`/folders/${id}`);
  },

  moveFolder: async (id: number, direction: string): Promise<Folder> => {
    const { data } = await httpClient.post<Folder>(`/folders/${id}/move`, { direction });
    return data;
  },
};
