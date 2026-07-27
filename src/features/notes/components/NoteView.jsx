import React, { useState } from 'react';
import NoteCard from './NoteCard';
import CreateNoteModal from './CreateNoteModal';

function NoteView() {
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateNote = async (formData) => {
    const newNote = {
      id: Date.now(),
      title: formData.get('title') || 'Untitled Note',
      preview: 'This is a preview of the note content.',
      date: new Date().toISOString(),
    };
    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-content-primary">Notes</h1>

      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-4 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors"
      >
        Create Note
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length > 0 ? (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => alert(`Viewing note: ${note.title}`)}
              onRename={async (newTitle) => {
                try {
                  const updatedNote = { ...note, title: newTitle };
                  setNotes(prevNotes =>
                    prevNotes.map(n => n.id === note.id ? updatedNote : n)
                  );
                } catch (error) {
                  console.error('Error renaming note:', error);
                  alert('Failed to rename note');
                }
              }}
              onDelete={() => {
                setNotes(prevNotes => prevNotes.filter(n => n.id !== note.id));
              }}
              onAddToFolder={() => {}}
              onRemoveFromFolder={() => {}}
            />
          ))
        ) : (
          <p className="text-content-tertiary">No notes yet</p>
        )}
      </div>

      <CreateNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateNote}
      />
    </div>
  );
}

export default NoteView;
