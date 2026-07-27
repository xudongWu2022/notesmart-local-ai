import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../../db/db';
import { createFolder } from '../../../../features/folders/services/folderOperations';

export function useSidebarFolders() {
  const [folders, setFolders] = useState([]);
  const [editingFolder, setEditingFolder] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);

  const fetchFolders = useCallback(async () => {
    try {
      const dbFolders = await db.folders.toArray();

      const foldersWithCounts = await Promise.all(
        dbFolders.map(async (folder, index) => {
          const count = await db.notes
            .where('folderId')
            .equals(folder.id)
            .count();
          return {
            ...folder,
            count,
            position: folder.position ?? index,
          };
        }),
      );

      const sortedFolders = foldersWithCounts.sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0),
      );

      setFolders(sortedFolders);
    } catch (err) {
      console.error('Failed to load folders:', err);
    }
  }, []);

  useEffect(() => {
    fetchFolders();

    const handleFolderUpdate = () => fetchFolders();
    window.addEventListener('folderUpdate', handleFolderUpdate);

    const intervalId = setInterval(fetchFolders, 5000);

    return () => {
      window.removeEventListener('folderUpdate', handleFolderUpdate);
      clearInterval(intervalId);
    };
  }, [fetchFolders]);

  const moveFolder = async (folderId, direction) => {
    try {
      const allFolders = await db.folders.toArray();
      const currentIndex = allFolders.findIndex((f) => f.id === folderId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= allFolders.length) return;

      const folder1 = allFolders[currentIndex];
      const folder2 = allFolders[newIndex];
      const tempPosition = folder1.position || currentIndex;

      await db.folders.update(folder1.id, {
        position: folder2.position || newIndex,
        lastModified: new Date().toISOString(),
        syncStatus: 'pending',
      });

      await db.folders.update(folder2.id, {
        position: tempPosition,
        lastModified: new Date().toISOString(),
        syncStatus: 'pending',
      });

      await fetchFolders();
      setShowFolderMenu(false);
    } catch (err) {
      console.error('Failed to move folder:', err);
    }
  };

  const updateFolderName = async (folderId, newName) => {
    try {
      await db.folders.update(folderId, {
        name: newName,
        lastModified: new Date().toISOString(),
        syncStatus: 'pending',
      });
      await fetchFolders();
      setEditingFolder(null);
    } catch (err) {
      console.error('Failed to update folder name:', err);
    }
  };

  const handleDeleteClick = (folder) => {
    setFolderToDelete(folder);
    setShowFolderMenu(false);
  };

  const createNewFolder = async () => {
    try {
      const count = folders.length;
      const name = count > 0 ? `New Folder ${count + 1}` : 'New Folder';
      await createFolder({ name });
      await fetchFolders();
      window.dispatchEvent(new Event('folderUpdate'));
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
  };

  return {
    folders,
    editingFolder,
    setEditingFolder,
    selectedFolder,
    setSelectedFolder,
    showFolderMenu,
    setShowFolderMenu,
    folderToDelete,
    setFolderToDelete,
    fetchFolders,
    moveFolder,
    updateFolderName,
    handleDeleteClick,
    createNewFolder,
  };
}
