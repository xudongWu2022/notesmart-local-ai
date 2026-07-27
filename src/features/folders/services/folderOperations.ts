import { db } from '../../../db/db';
import type { Note } from '../../../shared/types/note';
import type { Folder } from '../../../shared/types/folder';

export const createFolder = async (
  folderData: { name: string },
  onSuccess?: ((id: number) => void) | null,
): Promise<number> => {
  try {
    const existingFolder = await db.folders.where('name').equals(folderData.name.trim()).first();

    if (existingFolder) {
      throw new Error('A folder with this name already exists');
    }

    const folder: Omit<Folder, 'id'> = {
      name: folderData.name.trim(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      syncStatus: 'pending',
    };

    const id = await db.folders.add(folder as Folder);

    if (onSuccess) {
      onSuccess(id);
    }

    return id;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

export const addNoteToFolder = async (noteId: number, folderId: number): Promise<void> => {
  try {
    await db.notes.update(noteId, {
      folderId,
      lastModified: new Date().toISOString(),
      syncStatus: 'pending',
    });
  } catch (error) {
    console.error('Error adding note to folder:', error);
    throw error;
  }
};

export const getFolderNotes = async (folderId: number): Promise<Note[]> => {
  try {
    return await db.notes.where('folderId').equals(folderId).toArray();
  } catch (error) {
    console.error('Error getting folder notes:', error);
    throw error;
  }
};

export const removeFromFolder = async (noteId: number): Promise<void> => {
  try {
    await db.notes.update(noteId, {
      folderId: undefined,
      lastModified: new Date().toISOString(),
      syncStatus: 'pending',
    });
  } catch (error) {
    console.error('Error removing note from folder:', error);
    throw error;
  }
};

export const validateFolderName = async (
  name: string,
  excludeFolderId?: number | null,
): Promise<boolean> => {
  const existingFolder = await db.folders.where('name').equals(name.trim()).first();

  if (existingFolder && existingFolder.id !== excludeFolderId) {
    throw new Error('A folder with this name already exists');
  }
  return true;
};

export const renameFolder = async (folderId: number, newName: string): Promise<void> => {
  try {
    await validateFolderName(newName, folderId);

    await db.folders.update(folderId, {
      name: newName.trim(),
      lastModified: new Date().toISOString(),
      syncStatus: 'pending',
    });
  } catch (error) {
    console.error('Error renaming folder:', error);
    throw error;
  }
};
