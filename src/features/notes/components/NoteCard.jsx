import { useState, useRef, useEffect } from 'react';
import { FiClock, FiMoreVertical, FiEdit2, FiFolder, FiTrash2, FiFolderMinus } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { db } from '../../../db/db';

function NoteCard({ note, onClick, onRename, _onDelete, onAddToFolder, onRemoveFromFolder }) {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const handleActionClick = async (e, action, type) => {
    e.stopPropagation();
    setShowActions(false);
    
    try {
      if (type === 'rename') {
        const newTitle = prompt('Enter new title:', note.title);
        if (newTitle && newTitle !== note.title) {
          await db.notes.update(note.id, {
            title: newTitle,
            lastModified: new Date().toISOString(),
            syncStatus: 'pending'
          });
          
          if (typeof onRename === 'function') {
            onRename(newTitle);
          } else {
            window.location.reload();
          }
        }
      } 
      else if (type === 'addToFolder') {
        if (typeof onAddToFolder === 'function') {
          const folderId = await onAddToFolder();
          if (folderId) {
            await db.notes.update(note.id, {
              folderId,
              lastModified: new Date().toISOString(),
              syncStatus: 'pending'
            });
            
            // 触发一个自定义事件来通知 Sidebar 更新
            const event = new CustomEvent('folderUpdate');
            window.dispatchEvent(event);
            
            // 如果仍需要刷新页面，可以保留这行
            window.location.reload();
          }
        }
      }
      else if (type === 'removeFromFolder') {
        if (typeof onRemoveFromFolder === 'function') {
          await db.notes.update(note.id, {
            folderId: null,
            lastModified: new Date().toISOString(),
            syncStatus: 'pending'
          });
          onRemoveFromFolder();
          window.location.reload();
        }
      }
      else if (type === 'delete') {
        try {
          await db.notes.delete(note.id);
          window.location.reload();
        } catch (error) {
          console.error('Error deleting note:', error);
          alert('Failed to delete note');
        }
      } 
      else {
        if (typeof action === 'function') {
          action();
        }
      }
    } catch (error) {
      console.error(`Error in ${type} action:`, error);
      alert(`Failed to ${type} note: ${error.message}`);
    }
  };

  return (
    <div
      className="group relative bg-surface-card
                 hover:bg-surface-card
                 p-5 rounded-xl border border-border-subtle
                 hover:border-blue-200/80 dark:hover:border-blue-800/50 hover:shadow-xl hover:shadow-blue-100/30 dark:hover:shadow-blue-900/20
                 transition-all duration-300 cursor-pointer
                 backdrop-blur-sm backdrop-filter
                 w-full h-[220px] flex flex-col
                 before:absolute before:inset-0 before:rounded-xl
                 before:bg-gradient-to-br before:from-blue-500/5 before:to-purple-500/5 
                 before:opacity-0 hover:before:opacity-100 before:transition-opacity
                 before:pointer-events-none"
      onClick={onClick}
    >
      {/* Actions Menu Button */}
      <div className="absolute right-3 top-3 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
          className="p-2 hover:bg-black/5 rounded-xl transition-colors
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <FiMoreVertical className="w-4 h-4 text-content-tertiary group-hover:text-content-secondary" />
        </button>

        {/* Actions Dropdown */}
        {showActions && (
          <div 
            ref={actionsRef}
            className="absolute right-0 mt-1 w-52 bg-surface-card/95 border border-border-subtle
                      rounded-xl shadow-lg shadow-black/5 backdrop-blur-sm backdrop-filter
                      transform origin-top-right transition-all duration-200 z-30
                      overflow-hidden"
          >
            <button
              onClick={(e) => handleActionClick(e, null, 'rename')}
              className="w-full px-4 py-2.5 text-left hover:bg-blue-50/80 flex items-center gap-3
                         text-content-secondary hover:text-content-primary transition-colors"
            >
              <FiEdit2 className="w-4 h-4" />
              <span className="font-medium">Rename</span>
            </button>

            {!note.folderId ? (
              <button
                onClick={(e) => handleActionClick(e, null, 'addToFolder')}
                className="w-full px-4 py-2.5 text-left hover:bg-blue-50/80 flex items-center gap-3
                           text-content-secondary hover:text-content-primary transition-colors"
              >
                <FiFolder className="w-4 h-4" />
                <span className="font-medium">Add to Folder</span>
              </button>
            ) : (
              <button
                onClick={(e) => handleActionClick(e, null, 'removeFromFolder')}
                className="w-full px-4 py-2.5 text-left hover:bg-blue-50/80 flex items-center gap-3
                           text-content-secondary hover:text-content-primary transition-colors"
              >
                <FiFolderMinus className="w-4 h-4" />
                <span className="font-medium">Remove from Folder</span>
              </button>
            )}
            
            <div className="h-px bg-border-subtle mx-3 my-1"></div>
            
            <button
              onClick={(e) => handleActionClick(e, null, 'delete')}
              className="w-full px-4 py-2.5 text-left hover:bg-red-50/80 flex items-center gap-3
                         text-red-500 hover:text-red-600 transition-colors group/delete"
            >
              <FiTrash2 className="w-4 h-4 transition-transform group-hover/delete:rotate-12" />
              <span className="font-medium">Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Note Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Note Title */}
        <h3 className="font-semibold text-content-primary mb-2.5 pr-10 truncate text-base
                     transition-colors">
          {note.title || 'Untitled Note'}
        </h3>

        {/* Note Preview */}
        <div 
          className="text-content-secondary text-sm mb-3 flex-1 overflow-hidden
                     prose prose-sm max-w-none line-clamp-5
                     [&>*]:text-sm [&>*]:my-0 [&>*]:leading-relaxed
                     [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-content-primary [&_h1]:my-1
                     [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-content-secondary [&_h2]:my-1
                     [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-content-secondary [&_h3]:my-0.5
                     [&_p]:mb-1 [&_p]:line-clamp-2 [&_p]:text-content-secondary
                     [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5
                     [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5
                     [&_li]:my-0.5 [&_li]:text-content-secondary
                     [&_em]:text-content-secondary [&_em]:font-normal [&_em]:not-italic
                     [&_strong]:font-medium [&_strong]:text-content-primary
                     transition-colors duration-300"
          dangerouslySetInnerHTML={{
            __html: note.preview || note.content || '<p>No content</p>'
          }}
        />
      </div>

      {/* Note Footer */}
      <div className="flex items-center justify-between text-xs pt-3
                      border-t border-border-subtle">
        <div className="flex items-center text-content-tertiary group-hover:text-content-secondary
                      transition-colors">
          <FiClock className="w-3.5 h-3.5 mr-1.5 stroke-[1.5]" />
          <span>{formatDate(note.date || note.lastModified)}</span>
        </div>

        {note.folderId && (
          <div className="flex items-center px-2.5 py-1 bg-surface-hover rounded-full
                         text-content-secondary group-hover:bg-blue-50/80 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600
                         border border-border-subtle group-hover:border-blue-100/80 dark:group-hover:border-blue-800/50
                         transition-all duration-300">
            <FiFolder className="w-3.5 h-3.5 mr-1.5 stroke-[1.5]" />
            <span className="truncate max-w-[100px] font-medium">
              {note.folderName || 'Folder'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

NoteCard.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
    preview: PropTypes.string,
    content: PropTypes.string,
    date: PropTypes.string,
    lastModified: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    folderId: PropTypes.number,
    folderName: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAddToFolder: PropTypes.func.isRequired,
  onRemoveFromFolder: PropTypes.func.isRequired,
};

export default NoteCard; 