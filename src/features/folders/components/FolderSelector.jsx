import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiFolder, FiX, FiPlus, FiSearch } from 'react-icons/fi';
import { db } from '../../../db/db';
import { createFolder } from '../services/folderOperations';

const FolderSelector = ({ onSelect, onClose, onFolderChange }) => {
  const { t } = useTranslation();
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFolders = async () => {
      try {
        setLoading(true);
        const allFolders = await db.folders.toArray();
        setFolders(allFolders.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        setError('Failed to load folders');
      } finally {
        setLoading(false);
      }
    };
    loadFolders();
  }, []);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      setError(null);
      await createFolder({ name: newFolderName });
      const allFolders = await db.folders.toArray();
      setFolders(allFolders.sort((a, b) => a.name.localeCompare(b.name)));
      setNewFolderName('');
      setIsCreating(false);
      if (onFolderChange) {
        onFolderChange();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-card rounded-xl shadow-lg border border-border-subtle w-full max-w-md m-4">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-content-primary">{t('notes.addToFolder')}</h3>
          <button
            onClick={onClose}
            className="text-content-tertiary hover:text-content-primary transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-tertiary" />
            <input
              type="text"
              placeholder={t('common.search') + '...'}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface-input
                text-content-primary focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 mx-4 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Folders List */}
        <div className="max-h-64 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="text-center py-8 text-content-secondary">
              {searchTerm ? 'No matching folders found' : 'No folders available'}
            </div>
          ) : (
            filteredFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => onSelect(folder.id)}
                className="w-full text-left px-4 py-3 hover:bg-surface-hover rounded-lg
                  flex items-center group transition-colors"
              >
                <FiFolder className="mr-3 text-content-tertiary group-hover:text-content-secondary" />
                <span className="truncate text-content-secondary group-hover:text-content-primary">
                  {folder.name}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Create New Folder */}
        <div className="p-4 border-t border-border">
          {isCreating ? (
            <form onSubmit={handleCreateFolder} className="space-y-2">
              <input
                type="text"
                placeholder="Enter folder name"
                className="w-full px-4 py-2 border border-border rounded-lg bg-surface-input
                  text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg
                    hover:bg-primary-700 transition-colors"
                >
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewFolderName('');
                  }}
                  className="flex-1 py-2 border border-border rounded-lg
                    text-content-secondary hover:bg-surface-hover transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2 px-4 text-content-secondary hover:bg-surface-hover
                rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <FiPlus />
              <span>{t('sidebar.newFolder')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderSelector;
