import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiFolder,
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiPlus,
} from 'react-icons/fi';

export default function SidebarFolders({
  isOpen,
  isFoldersExpanded,
  onToggleExpand,
  slideAnimation,
  folders,
  selectedFolder,
  showFolderMenu,
  editingFolder,
  onFolderClick,
  onFolderContextMenu,
  onEditingChange,
  onUpdateFolderName,
  onMoveFolder,
  onDeleteClick,
  onCloseFolderMenu,
  onCreateFolder,
}) {
  const folderMenuRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (folderMenuRef.current && !folderMenuRef.current.contains(event.target)) {
        onCloseFolderMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCloseFolderMenu]);

  const handleClick = (folder, e) => {
    if (e.type === 'contextmenu') {
      e.preventDefault();
      onFolderContextMenu(folder);
    } else {
      navigate(`/folders/${folder.id}`);
    }
  };

  return (
    <div className="px-3 py-4">
      {isOpen && (
        <div className="flex items-center justify-between px-3 mb-2">
          <span className={`text-xs font-medium text-content-tertiary
            uppercase tracking-wider transition-all duration-300 ${slideAnimation}`}>
            {t('sidebar.folders')}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onCreateFolder}
              className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors
                text-content-tertiary hover:text-primary-500"
              aria-label={t('sidebar.newFolder')}
              title={t('sidebar.newFolder')}
            >
              <FiPlus className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleExpand}
              className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors"
            >
              {isFoldersExpanded
                ? <FiChevronDown className="w-4 h-4 text-content-tertiary" />
                : <FiChevronRight className="w-4 h-4 text-content-tertiary" />
              }
            </button>
          </div>
        </div>
      )}

      <div className={`space-y-1 transition-all duration-300
        ${!isFoldersExpanded && 'opacity-50'}`}>
        {isOpen && isFoldersExpanded && folders.map((folder) => (
          <div
            key={folder.id}
            className={`group relative transition-all duration-200
              ${selectedFolder?.id === folder.id ? 'z-10' : 'z-0'}`}
          >
            <div
              className={`
                flex items-center justify-between px-3 py-2.5 rounded-xl
                transition-all duration-200
                hover:bg-surface-hover cursor-pointer
                ${selectedFolder?.id === folder.id ? 'bg-surface-hover shadow-sm' : ''}
              `}
              onClick={(e) => handleClick(folder, e)}
              onContextMenu={(e) => handleClick(folder, e)}
            >
              {editingFolder?.id === folder.id ? (
                <input
                  type="text"
                  className="flex-1 px-2 py-1 text-sm border border-border rounded-md
                    bg-surface-input text-content-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-400"
                  value={editingFolder.name}
                  onChange={(e) => onEditingChange({ ...editingFolder, name: e.target.value })}
                  onBlur={() => onUpdateFolderName(folder.id, editingFolder.name)}
                  onKeyPress={(e) => e.key === 'Enter' && onUpdateFolderName(folder.id, editingFolder.name)}
                  autoFocus
                />
              ) : (
                <>
                  <div className="flex items-center flex-1 min-w-0">
                    <FiFolder className="h-4 w-4 text-content-tertiary flex-shrink-0 mr-3" />
                    <span className="text-sm text-content-secondary truncate">{folder.name}</span>
                  </div>
                  <span className="text-xs text-content-tertiary ml-2">{folder.count}</span>
                </>
              )}
            </div>

            {showFolderMenu && selectedFolder?.id === folder.id && (
              <div
                ref={folderMenuRef}
                className="absolute left-full ml-2 bg-surface-card/95 backdrop-blur-sm
                  border border-border-subtle rounded-xl shadow-xl py-1.5 z-30
                  min-w-[160px] transform transition-all duration-200"
              >
                <button
                  onClick={() => onMoveFolder(folder.id, 'up')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover
                    flex items-center text-content-secondary"
                >
                  <FiArrowUp className="mr-2 w-4 h-4" /> {t('sidebar.moveUp')}
                </button>
                <button
                  onClick={() => onMoveFolder(folder.id, 'down')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover
                    flex items-center text-content-secondary"
                >
                  <FiArrowDown className="mr-2 w-4 h-4" /> {t('sidebar.moveDown')}
                </button>
                <button
                  onClick={() => {
                    onEditingChange(folder);
                    onCloseFolderMenu();
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover
                    flex items-center text-content-secondary"
                >
                  <FiEdit2 className="mr-2 w-4 h-4" /> {t('common.rename')}
                </button>
                <div className="h-px bg-border-subtle my-1" />
                <button
                  onClick={() => onDeleteClick(folder)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50
                    dark:hover:bg-red-900/20 flex items-center text-red-600"
                >
                  <FiTrash2 className="mr-2 w-4 h-4" /> {t('common.delete')}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Empty state */}
        {isOpen && isFoldersExpanded && folders.length === 0 && (
          <div className="px-3 py-6 text-center">
            <FiFolder className="w-8 h-8 text-content-tertiary mx-auto mb-2 opacity-50" />
            <p className="text-sm text-content-tertiary mb-3">
              {t('sidebar.emptyFolders')}
            </p>
            <button
              onClick={onCreateFolder}
              className="text-sm text-primary-500 hover:text-primary-600
                dark:hover:text-primary-400 font-medium transition-colors"
            >
              {t('sidebar.createFirstFolder')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
