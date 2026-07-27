import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, updateNote } from '../../../db/db';
import { generateNote } from '../services/noteGenerationService';
import html2pdf from 'html2pdf.js';
import MarkdownIt from 'markdown-it';

export function useNoteDetail() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [activeTab, setActiveTab] = useState('Note');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editContent, setEditContent] = useState('');
  const [sidebarState, setSidebarState] = useState({
    isCollapsed: false,
    size: { width: 300 },
    COLLAPSED_SIZE: 40,
  });

  // Combine notes state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availableNotes, setAvailableNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isCombining, setIsCombining] = useState(false);

  // Attachments state
  const [attachments, setAttachments] = useState([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    attachmentId: null,
  });

  const tabs = ['Note', 'Quiz', 'Flashcards', 'Mindmap', 'About'];

  // Fetch note from database
  useEffect(() => {
    let isMounted = true;

    const fetchNote = async () => {
      setIsLoading(true);
      try {
        const noteData = await db.notes.get(parseInt(noteId));
        if (isMounted) setNote(noteData);
      } catch (error) {
        console.error('Error fetching note:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchNote();
    return () => {
      isMounted = false;
    };
  }, [noteId]);

  // Init edit content when entering edit mode
  useEffect(() => {
    if (isEditing && note) {
      setEditContent(note.content || '');
    }
  }, [isEditing, note]);

  // Load attachments
  useEffect(() => {
    const loadAttachments = async () => {
      if (note?.attachments?.length) {
        const attachmentData = await Promise.all(
          note.attachments.map((id) => db.attachments.get(id)),
        );
        setAttachments(attachmentData);
      }
    };
    loadAttachments();
  }, [note]);

  const handleNoteUpdate = async () => {
    setIsLoading(true);
    try {
      const updatedNote = {
        ...note,
        content: editContent,
        lastModified: new Date().toISOString(),
      };
      await db.notes.update(note.id, updatedNote);
      setNote(updatedNote);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(note.content);
  };

  const handleContentChange = (newContent) => {
    setEditContent(newContent);
  };

  const handleSave = async () => {
    if (editContent.trim() !== note.content) {
      try {
        await updateNote(note.id, {
          content: editContent,
          lastModified: new Date().toISOString(),
        });
        setNote({ ...note, content: editContent });
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to save note:', error);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCombineNotes = async () => {
    if (!selectedNoteId) return;
    setIsCombining(true);
    try {
      const selectedNote = await db.notes.get(selectedNoteId);
      const combinedTranscript = `${note.transcript || ''}\n\n${selectedNote.transcript || ''}`;
      const newNoteContent = await generateNote(combinedTranscript, note.noteLanguage);

      const combinedNote = {
        title: `Combined: ${note.title} & ${selectedNote.title}`,
        content: newNoteContent,
        transcript: combinedTranscript,
        noteLanguage: note.noteLanguage,
        date: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      const newNoteId = await db.notes.put(combinedNote);
      navigate(`/notes/${newNoteId}`);
    } catch (error) {
      console.error('Error combining notes:', error);
    } finally {
      setIsCombining(false);
      setIsAddModalOpen(false);
    }
  };

  const handleNoteSelect = async (id) => {
    setSelectedNoteId(id);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setSelectedNoteId(null);
  };

  const handleDownload = async (attachment) => {
    try {
      const { blob, fileName } = await db.getAttachment(attachment.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDeleteAttachment = (attachmentId) => {
    setDeleteConfirmation({ isOpen: true, attachmentId });
  };

  const confirmDelete = async () => {
    try {
      const attachmentId = deleteConfirmation.attachmentId;
      await db.deleteAttachment(attachmentId, note.id);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      setDeleteConfirmation({ isOpen: false, attachmentId: null });
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleExport = useCallback(async () => {
    if (!note) return;
    try {
      const md = new MarkdownIt();
      const tempDiv = document.createElement('div');
      tempDiv.className = 'pdf-export-container';

      const titleElement = document.createElement('h1');
      titleElement.textContent = note.title;
      tempDiv.appendChild(titleElement);

      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = md.render(note.content);
      tempDiv.appendChild(contentDiv);

      tempDiv.style.padding = '40px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';

      const options = {
        margin: 10,
        filename: `${note.title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().from(tempDiv).set(options).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }, [note]);

  return {
    note,
    noteId,
    navigate,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    isLoading,
    editContent,
    setEditContent,
    sidebarState,
    setSidebarState,
    tabs,

    // Actions
    handleNoteUpdate,
    handleStartEdit,
    handleContentChange,
    handleSave,
    handleExport,

    // Combine
    isAddModalOpen,
    setIsAddModalOpen,
    availableNotes,
    selectedNoteId,
    isCombining,
    handleCombineNotes,
    handleNoteSelect,
    handleCloseModal,

    // Attachments
    attachments,
    deleteConfirmation,
    setDeleteConfirmation,
    handleDownload,
    handleDeleteAttachment,
    confirmDelete,
  };
}
