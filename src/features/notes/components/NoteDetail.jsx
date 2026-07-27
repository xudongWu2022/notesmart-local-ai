import React from 'react';
import QuizPanel from '../../quiz/components/QuizPanel';
import FlashcardPanel from '../../flashcards/components/FlashcardPanel';
import DraggableSidebar from '../../../shared/components/layout/DraggableSidebar';
import AiAssistant from '../../ai/components/AiAssistant';
import MindmapPanel from '../../mindmap/components/MindmapPanel';
import NoteContent from './NoteContent';
import NoteDetailHeader from './NoteDetailHeader';
import NoteTabBar from './NoteTabBar';
import NoteAboutPanel from './NoteAboutPanel';
import CombineNotesModal from './CombineNotesModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { useNoteDetail } from '../hooks/useNoteDetail';
import '../../../shared/styles/gradients.css';

function NoteDetail() {
  const {
    note,
    navigate,
    activeTab,
    setActiveTab,
    isEditing,
    isLoading,
    editContent,
    sidebarState,
    setSidebarState,
    tabs,
    handleNoteUpdate,
    handleStartEdit,
    handleContentChange,
    handleSave,
    handleExport,
    isAddModalOpen,
    availableNotes,
    selectedNoteId,
    isCombining,
    handleCombineNotes,
    handleNoteSelect,
    handleCloseModal,
    attachments,
    deleteConfirmation,
    setDeleteConfirmation,
    handleDownload,
    handleDeleteAttachment,
    confirmDelete,
  } = useNoteDetail();

  if (isLoading || !note) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex relative overflow-x-hidden">
      {/* Main Content */}
      <div
        className="flex-1 flex flex-col overflow-x-hidden"
        style={{
          marginRight: `${sidebarState.isCollapsed ? sidebarState.COLLAPSED_SIZE : sidebarState.size.width}px`,
          transition: 'margin-right 0.2s ease-out',
        }}
      >
        <NoteDetailHeader
          note={note}
          isEditing={isEditing}
          onNavigateBack={() => navigate(-1)}
          onSave={handleNoteUpdate}
          onEdit={handleStartEdit}
          onExport={handleExport}
        />

        <NoteTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {activeTab === 'Note' && (
            <div className="h-full w-full bg-gradient-note">
              <div className="max-w-[1920px] mx-auto px-2 sm:px-3 py-4">
                <NoteContent
                  content={note.content}
                  isEditing={isEditing}
                  editContent={editContent}
                  onEdit={handleStartEdit}
                  onEditChange={handleContentChange}
                  onSave={handleSave}
                />
              </div>
            </div>
          )}

          {activeTab === 'Quiz' && (
            <div className="h-full overflow-hidden bg-gradient-quiz">
              <QuizPanel noteContent={note?.content} noteId={note?.id} />
            </div>
          )}

          {activeTab === 'Flashcards' && (
            <div className="h-full overflow-hidden bg-gradient-flashcard">
              <FlashcardPanel noteContent={note?.content} noteId={note?.id} />
            </div>
          )}

          {activeTab === 'Mindmap' && (
            <div className="h-full bg-gradient-mindmap">
              <MindmapPanel
                noteContent={note?.content}
                isVisible={activeTab === 'Mindmap'}
              />
            </div>
          )}

          {activeTab === 'About' && (
            <NoteAboutPanel
              note={note}
              attachments={attachments}
              onDownload={handleDownload}
              onDelete={handleDeleteAttachment}
            />
          )}
        </div>
      </div>

      {/* AI Assistant */}
      <DraggableSidebar
        title="AI Assistant"
        defaultWidth={350}
        minWidth={280}
        initialPosition="right"
        defaultTab="Chat"
        onStateChange={setSidebarState}
      >
        <AiAssistant label="Chat" noteContent={note?.content || ''} />
      </DraggableSidebar>

      {/* Combine Notes Modal */}
      {isAddModalOpen && (
        <CombineNotesModal
          noteTitle={note.title}
          availableNotes={availableNotes}
          selectedNoteId={selectedNoteId}
          isCombining={isCombining}
          onNoteSelect={handleNoteSelect}
          onCombine={handleCombineNotes}
          onClose={handleCloseModal}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <DeleteConfirmDialog
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation({ isOpen: false, attachmentId: null })}
        />
      )}
    </div>
  );
}

export default NoteDetail;
