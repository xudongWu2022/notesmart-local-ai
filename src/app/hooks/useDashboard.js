import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../db/db';
import { transcribeAudio } from '../../features/transcription/services/transcriptionService';
import { generateNote, saveNote } from '../../features/notes/services/noteGenerationService';
import { handleDocumentUpload, validateFile } from '../../features/documents/services/documentService';

export function useDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showLiveTranscription, setShowLiveTranscription] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentNotes, setRecentNotes] = useState([]);
  const [showAudioUpload, setShowAudioUpload] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentLanguage, setDocumentLanguage] = useState('en');
  const [noteLanguage, setNoteLanguage] = useState('en');
  const [stats, setStats] = useState({ totalNotes: 0, thisWeek: 0, memberSince: null });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
  ];

  useEffect(() => {
    const loadRecentNotes = async () => {
      try {
        const notes = await db.notes
          .orderBy('date')
          .reverse()
          .limit(10)
          .toArray();
        setRecentNotes(notes);
      } catch (error) {
        console.error('Error loading recent notes:', error);
      }
    };
    loadRecentNotes();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const total = await db.notes.count();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisWeek = await db.notes.where('date').above(weekAgo.toISOString()).count();
        const oldest = await db.notes.orderBy('date').first();
        setStats({ totalNotes: total, thisWeek, memberSince: oldest?.date || null });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    setShowLiveTranscription(false);
  }, [location]);

  const handleSubjectSelect = (subjectId) => {
    setShowSubjectModal(false);
  };

  const handleInputSelect = async (optionId) => {
    if (optionId === 'youtube') {
      setShowYouTubeModal(true);
    } else if (optionId === 'document') {
      setShowDocumentModal(true);
    } else if (optionId === 'lecture') {
      navigate('/transcription');
    } else if (optionId === 'audio') {
      setShowAudioUpload(true);
    }
  };

  const handleAudioUpload = async (formData) => {
    try {
      setIsProcessing(true);
      setShowProgress(true);

      setProgress(0);
      setProgressStatus('Transcribing audio...');
      const { transcription, suggestedTitle, confidence, duration } = await transcribeAudio(formData);
      setProgress(30);

      setProgressStatus('Generating structured note...');
      const noteLang = formData.get('noteLanguage');
      const structuredNote = await generateNote(transcription, noteLang);
      setProgress(60);

      setProgressStatus('Saving note...');
      const userTitle = formData.get('title');
      const finalTitle = userTitle || suggestedTitle;

      const noteData = {
        title: finalTitle,
        content: structuredNote,
        transcript: transcription,
        audioLanguage: formData.get('audioLanguage'),
        noteLanguage: noteLang,
        confidence,
        duration,
        date: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      const noteId = await saveNote(noteData);
      setProgress(90);

      setProgressStatus('Finishing up...');
      setShowAudioUpload(false);

      const updatedNotes = await db.notes
        .orderBy('date')
        .reverse()
        .limit(10)
        .toArray();
      setRecentNotes(updatedNotes);

      setProgress(100);
      setProgressStatus('Note created successfully!');

      setTimeout(() => {
        setShowProgress(false);
        navigate(`/notes/${noteId}`);
      }, 1000);
    } catch (error) {
      setShowProgress(false);
      console.error('Audio upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleYouTubeSubmit = async (result) => {
    try {
      if (!result?.noteId) return;
      setProgress(100);
      setProgressStatus('YouTube note created successfully!');
      setShowYouTubeModal(false);
      navigate(`/notes/${result.noteId}`);
    } catch (error) {
      console.error('YouTube processing error:', error);
    } finally {
      setIsProcessing(false);
      setShowProgress(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      validateFile(file);
      setIsProcessing(true);
      setShowProgress(true);
      setProgress(0);
      setProgressStatus('Processing document...');

      const result = await handleDocumentUpload(file, documentLanguage, noteLanguage);

      const noteData = {
        title: result.title,
        content: result.content,
        originalText: result.originalText,
        metadata: result.metadata,
        date: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        type: 'document',
      };

      const noteId = await saveNote(noteData);

      const updatedNotes = await db.notes
        .orderBy('date')
        .reverse()
        .limit(10)
        .toArray();
      setRecentNotes(updatedNotes);

      setShowDocumentModal(false);
      navigate(`/notes/${noteId}`);
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsProcessing(false);
      setShowProgress(false);
    }
  };

  return {
    navigate,
    stats,
    showSubjectModal,
    setShowSubjectModal,
    showLiveTranscription,
    setShowLiveTranscription,
    showSettings,
    setShowSettings,
    isProcessing,
    recentNotes,
    showAudioUpload,
    setShowAudioUpload,
    progress,
    progressStatus,
    showProgress,
    showYouTubeModal,
    setShowYouTubeModal,
    showDocumentModal,
    setShowDocumentModal,
    documentLanguage,
    setDocumentLanguage,
    noteLanguage,
    setNoteLanguage,
    languages,
    handleSubjectSelect,
    handleInputSelect,
    handleAudioUpload,
    handleYouTubeSubmit,
    handleFileUpload,
  };
}
