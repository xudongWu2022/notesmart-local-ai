import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft, FiBookOpen } from 'react-icons/fi';
import SidebarNav from './SidebarNav';
import SidebarFolders from './SidebarFolders';
import SidebarFooter from './SidebarFooter';
import { useSidebarFolders } from './hooks/useSidebarFolders';

function Sidebar({ isOpen, onToggle, isMobile }) {
  const { t } = useTranslation();
  const [isFoldersExpanded, setIsFoldersExpanded] = useState(true);

  const {
    folders,
    editingFolder,
    setEditingFolder,
    selectedFolder,
    setSelectedFolder,
    showFolderMenu,
    setShowFolderMenu,
    moveFolder,
    updateFolderName,
    handleDeleteClick,
    createNewFolder,
  } = useSidebarFolders();

  const slideAnimation = isOpen
    ? 'translate-x-0 opacity-100'
    : '-translate-x-3 opacity-0';

  const sidebarWidth = isMobile
    ? 'w-64'
    : isOpen ? 'w-64' : 'w-16';

  const sidebarTransform = isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0';

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-20 bg-surface-overlay transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      <div
        role="navigation"
        aria-label={t('sidebar.menu')}
        className={`
          fixed inset-y-0 left-0 z-30
          ${sidebarWidth} ${sidebarTransform}
          transition-all duration-300 ease-in-out
          bg-sidebar-bg/95 backdrop-blur-sm
          border-r border-border-subtle
          flex flex-col
          shadow-lg dark:shadow-black/20
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4
          border-b border-border-subtle backdrop-blur-sm bg-sidebar-bg/50">
          <div className="flex items-center">
            <FiBookOpen className={`w-6 h-6 text-primary-600 transition-all duration-300
              ${!isOpen ? 'mx-auto' : ''}`} />
            {isOpen && (
              <span className={`ml-3 text-xl font-bold bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500
                bg-clip-text text-transparent transition-all duration-300 ${slideAnimation}`}>
                NoteSmart
              </span>
            )}
          </div>
        </div>

        {/* Toggle Button — hidden on mobile */}
        {!isMobile && (
          <button
            onClick={onToggle}
            aria-label={isOpen ? t('sidebar.collapse') : t('sidebar.expand')}
            aria-expanded={isOpen}
            className="absolute -right-3 top-1/2 w-7 h-7 bg-surface-card/95
              backdrop-blur-sm border border-border
              rounded-full flex items-center justify-center
              shadow-sm hover:shadow-md
              transition-all duration-200 hover:border-primary-300
              hover:bg-primary-50/80 dark:hover:bg-primary-900/30 group"
          >
            <FiChevronLeft
              className={`w-4 h-4 text-content-secondary transition-all duration-200
                group-hover:text-primary-500 ${!isOpen && 'rotate-180'}`}
            />
          </button>
        )}

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <SidebarNav isOpen={isOpen} slideAnimation={slideAnimation} />
          <SidebarFolders
            isOpen={isOpen}
            isFoldersExpanded={isFoldersExpanded}
            onToggleExpand={() => setIsFoldersExpanded(!isFoldersExpanded)}
            slideAnimation={slideAnimation}
            folders={folders}
            selectedFolder={selectedFolder}
            showFolderMenu={showFolderMenu}
            editingFolder={editingFolder}
            onFolderContextMenu={(folder) => {
              setSelectedFolder(folder);
              setShowFolderMenu(true);
            }}
            onEditingChange={setEditingFolder}
            onUpdateFolderName={updateFolderName}
            onMoveFolder={moveFolder}
            onDeleteClick={handleDeleteClick}
            onCloseFolderMenu={() => setShowFolderMenu(false)}
            onCreateFolder={createNewFolder}
          />
        </div>

        <SidebarFooter isOpen={isOpen} />
      </div>
    </>
  );
}

export default Sidebar;
