import React, { useState, useCallback, useEffect } from 'react';
import { LiveTranscription } from './index';
import ErrorBoundary from '../../../shared/components/ui/ErrorBoundary';
import Sidebar from '../../../shared/components/layout/Sidebar';
import DraggableSidebar from '../../../shared/components/layout/DraggableSidebar';
import TranscriptionPanel from './TranscriptionPanel';
import AiAssistant from '../../ai/components/AiAssistant';
import Split from 'react-split';
import LiveNotes from '../../notes/components/LiveNotes';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useTranscriptStore } from '../hooks/useTranscripts';
import { saveNote } from '../../../db/db';
import { useNavigate } from 'react-router-dom';

function TranscriptionPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [rightSidebarState, setRightSidebarState] = useState({
    isCollapsed: false,
    size: { width: 400 },
    COLLAPSED_SIZE: 40
  });
  const [transcriptionContent, setTranscriptionContent] = useState('');
  const [transcriptionSegments, setTranscriptionSegments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [collapsedPanel, setCollapsedPanel] = useState(null);
  const COLLAPSE_THRESHOLD = 200;
  const [noteTitle, setNoteTitle] = useState(getDefaultTitle());
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const _addNote = useTranscriptStore(state => state.addNote);
  const _notes = useTranscriptStore(state => state.notes);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState('en-US');
  const [translationLanguage, setTranslationLanguage] = useState('en-US');
  const [isTranslating, setIsTranslating] = useState(false);
  const navigate = useNavigate();

  const handleTranscriptionUpdate = useCallback((content, segments) => {
    setTranscriptionContent(content);
    setTranscriptionSegments(segments);
  }, []);

  const handleRecordingToggle = useCallback(() => {
    setIsRecording(prev => !prev);
  }, []);

  const _handleSplitDrag = (sizes) => {
    const [leftSize, rightSize] = sizes;
    const leftWidth = window.innerWidth * (leftSize / 100);
    const rightWidth = window.innerWidth * (rightSize / 100);

    if (leftWidth < COLLAPSE_THRESHOLD && collapsedPanel !== 'left') {
      setCollapsedPanel('left');
    } else if (rightWidth < COLLAPSE_THRESHOLD && collapsedPanel !== 'right') {
      setCollapsedPanel('right');
    } else if (leftWidth >= COLLAPSE_THRESHOLD && rightWidth >= COLLAPSE_THRESHOLD) {
      setCollapsedPanel(null);
    }
  };

  function getDefaultTitle() {
    const now = new Date();
    return now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-');
  }

  const handleTitleChange = (e) => {
    setNoteTitle(e.target.value);
  };

  const handleTitleSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      setIsEditingTitle(false);
    }
  };

  const handleStartEditing = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.select();
      }
    }, 0);
  };

  const handleGenerateNote = useCallback(async () => {
    if (!transcriptionContent.trim()) return;

    try {
      const storeNotes = useTranscriptStore.getState().notes;
      
      const combinedContent = storeNotes.length === 0 
        ? transcriptionContent 
        : storeNotes
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(note => note.content)
            .join('\n');
      
      const noteData = {
        title: noteTitle || getDefaultTitle(),
        content: combinedContent,
        transcript: transcriptionContent,
        segments: transcriptionSegments,
        audioLanguage: transcriptionLanguage,
        noteLanguage: isTranslating ? translationLanguage : transcriptionLanguage,
        date: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        syncStatus: 'pending'
      };

      const noteId = await saveNote(noteData);

      setTranscriptionContent('');
      setTranscriptionSegments([]);
      
      return noteId;
    } catch (error) {
      console.error('Failed to generate note:', error);
      alert('Failed to generate note. Please try again.');
      throw error;
    }
  }, [transcriptionContent, noteTitle, transcriptionSegments, transcriptionLanguage, isTranslating, translationLanguage]);

  useEffect(() => {
    const handleBeforeUnload = async (_e) => {
      if (transcriptionContent.trim()) {
        try {
          await handleGenerateNote();
        } catch (error) {
          console.error('Failed to auto-save note:', error);
        }
      }
    };

    const _handleRouteChange = async () => {
      if (transcriptionContent.trim()) {
        try {
          await handleGenerateNote();
        } catch (error) {
          console.error('Failed to auto-save note:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      if (transcriptionContent.trim()) {
        handleGenerateNote().catch(error => {
          console.error('Failed to auto-save note on unmount:', error);
        });
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [transcriptionContent, handleGenerateNote]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-surface-bg">
        {/* Left Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        
        {/* Main Content */}
        <div 
          className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}
          style={{ 
            marginRight: rightSidebarState.isCollapsed 
              ? `${rightSidebarState.COLLAPSED_SIZE}px` 
              : `${rightSidebarState.size.width}px`
          }}
        >
          <div className="w-full h-full px-4 py-6">
            {/* Header Section with Back Button and Title */}
            <div className="flex items-center gap-6 mb-6">
              {/* Back Button - 优化设计 */}
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                         bg-gradient-to-br from-white/95 to-white/75 hover:from-white hover:to-white/90 
                         border border-white/60 hover:border-blue-200/80 backdrop-blur-sm
                         shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
                         hover:shadow-[0_8px_16px_-4px_rgba(59,130,246,0.15)]
                         transition-all duration-300 transform hover:-translate-x-0.5
                         relative overflow-hidden"
              >
                {/* 背景光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0
                              group-hover:via-blue-500/5 transition-all duration-300" />
                
                {/* 装饰性圆点 */}
                <div className="absolute left-1.5 top-1.5 w-1 h-1 rounded-full bg-blue-500/20 
                              group-hover:bg-blue-500/40 transition-all duration-300" />
                <div className="absolute right-1.5 top-1.5 w-1 h-1 rounded-full bg-blue-500/20 
                              group-hover:bg-blue-500/40 transition-all duration-300" />
                
                {/* 返回图标 */}
                <svg 
                  className="w-5 h-5 text-content-secondary group-hover:text-blue-600 transition-colors duration-300
                            relative z-10" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                    className="group-hover:stroke-dasharray-[30] group-hover:stroke-dashoffset-[30]
                              transition-all duration-500"
                  />
                </svg>

                {/* 文字 */}
                <span className="text-sm font-medium bg-gradient-to-r from-content-secondary to-content-secondary
                               group-hover:from-blue-600 group-hover:to-blue-500
                               bg-clip-text text-transparent transition-all duration-300 relative z-10">
                  Back
                </span>

                {/* 底部装饰线 */}
                <div className="absolute bottom-1.5 left-2 right-2 h-px bg-gradient-to-r 
                              from-transparent via-blue-500/0 to-transparent
                              group-hover:via-blue-500/30 transition-all duration-500" />
                
                {/* 悬浮时的光晕效果 */}
                <div className="absolute inset-0 rounded-xl bg-blue-400/0 
                              group-hover:bg-blue-400/5 blur-xl transition-all duration-500" />
              </button>

              {/* Title Section - 居中显示 */}
              <div className="flex-1 flex justify-center">
                {isEditingTitle ? (
                  <div className="relative group max-w-md">
                    <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 
                                  rounded-lg blur-sm group-hover:via-blue-500/10 transition-all duration-500" />
                    <div className="relative">
                      <input
                        type="text"
                        value={noteTitle}
                        onChange={handleTitleChange}
                        onKeyDown={handleTitleSubmit}
                        onBlur={handleTitleSubmit}
                        className="w-full text-2xl font-bold text-content-primary bg-transparent 
                                 border-b-2 border-blue-500/20 focus:border-blue-500 
                                 focus:outline-none px-4 py-2 text-center
                                 placeholder-gray-400/60
                                 transition-all duration-300"
                        placeholder="Enter title..."
                        autoFocus
                      />
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r 
                                    from-transparent via-blue-500/20 to-transparent 
                                    group-hover:via-blue-500/40 transition-all duration-300" />
                    </div>
                  </div>
                ) : (
                  <div className="group relative inline-block">
                    {/* 外层装饰框 */}
                    <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/[0.05] to-blue-600/[0.05] 
                                  rounded-xl blur-[2px] group-hover:from-blue-500/[0.08] 
                                  group-hover:to-blue-600/[0.08] transition-all duration-500" />
                    
                    {/* 装饰框 - 左上角 */}
                    <div className="absolute -left-3 -top-3 w-6 h-6">
                      <div className="absolute left-0 top-0 w-full h-full border-l-[2.5px] border-t-[2.5px] 
                                   rounded-tl-xl border-blue-500/30 group-hover:border-blue-500/50
                                   transition-all duration-300" />
                      <div className="absolute left-[2px] top-[2px] w-2 h-2 bg-blue-500/20 
                                   group-hover:bg-blue-500/30 rounded-full transition-all duration-300" />
                    </div>
                    
                    {/* 装饰框 - 右上角 */}
                    <div className="absolute -right-3 -top-3 w-6 h-6">
                      <div className="absolute right-0 top-0 w-full h-full border-r-[2.5px] border-t-[2.5px] 
                                   rounded-tr-xl border-blue-500/30 group-hover:border-blue-500/50
                                   transition-all duration-300" />
                      <div className="absolute right-[2px] top-[2px] w-2 h-2 bg-blue-500/20 
                                   group-hover:bg-blue-500/30 rounded-full transition-all duration-300" />
                    </div>
                    
                    {/* 装饰框 - 左下角 */}
                    <div className="absolute -left-3 -bottom-3 w-6 h-6">
                      <div className="absolute left-0 bottom-0 w-full h-full border-l-[2.5px] border-b-[2.5px] 
                                   rounded-bl-xl border-blue-500/30 group-hover:border-blue-500/50
                                   transition-all duration-300" />
                      <div className="absolute left-[2px] bottom-[2px] w-2 h-2 bg-blue-500/20 
                                   group-hover:bg-blue-500/30 rounded-full transition-all duration-300" />
                    </div>
                    
                    {/* 装饰框 - 右下角 */}
                    <div className="absolute -right-3 -bottom-3 w-6 h-6">
                      <div className="absolute right-0 bottom-0 w-full h-full border-r-[2.5px] border-b-[2.5px] 
                                   rounded-br-xl border-blue-500/30 group-hover:border-blue-500/50
                                   transition-all duration-300" />
                      <div className="absolute right-[2px] bottom-[2px] w-2 h-2 bg-blue-500/20 
                                   group-hover:bg-blue-500/30 rounded-full transition-all duration-300" />
                    </div>
                    
                    {/* 标题文本 */}
                    <h1 
                      className="relative text-2xl font-bold bg-gradient-to-br from-content-primary to-content-primary 
                               bg-clip-text text-transparent cursor-pointer px-4 py-2
                               group-hover:from-blue-600 group-hover:to-blue-500 
                               transition-all duration-300"
                      onClick={handleStartEditing}
                    >
                      {noteTitle || getDefaultTitle()}
                    </h1>
                    
                    {/* 底部装饰线 */}
                    <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r 
                                  from-transparent via-blue-500/20 to-transparent
                                  group-hover:via-blue-500/40 transition-all duration-500" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Split Container */}
            <Split
              className="flex h-[calc(100vh-120px)]"
              sizes={collapsedPanel === 'left' ? [0, 100] : 
                     collapsedPanel === 'right' ? [100, 0] : 
                     [50, 50]}
              minSize={100}
              gutterSize={12}
              gutterStyle={() => ({
                backgroundColor: '#f3f4f6',
                cursor: 'col-resize',
                margin: '0 -6px',
                width: '12px',
                position: 'relative',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#e5e7eb',
                }
              })}
            >
              {/* Left Panel - Live Transcription */}
              <div className={`pr-2 transition-all duration-300 ${
                collapsedPanel === 'left' ? 'w-0 overflow-hidden' : 'w-full'
              }`}>
                <LiveTranscription 
                  onTranscriptionUpdate={handleTranscriptionUpdate}
                  isRecording={isRecording}
                />
                {collapsedPanel === 'left' && (
                  <button
                    onClick={() => setCollapsedPanel(null)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-blue-500 
                             text-white p-2 rounded-r-lg shadow-lg hover:bg-blue-600 
                             transition-all duration-300 hover:shadow-[0_4px_12px_-4px_rgba(59,130,246,0.5)]"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Right Panel - Live Notes */}
              <div className={`pl-2 transition-all duration-300 ${
                collapsedPanel === 'right' ? 'w-0 overflow-hidden' : 'w-full'
              }`}>
                <LiveNotes />
                {collapsedPanel === 'right' && (
                  <button
                    onClick={() => setCollapsedPanel(null)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 
                             text-white p-2 rounded-l-lg shadow-lg hover:bg-blue-600 
                             transition-all duration-300 hover:shadow-[0_4px_12px_-4px_rgba(59,130,246,0.5)]"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </Split>
          </div>
        </div>

        {/* Right Sidebar */}
        <DraggableSidebar
          title="Controls"
          defaultWidth={320}
          minWidth={320}
          initialPosition="right"
          defaultTab="Transcription"
          onStateChange={setRightSidebarState}
        >
          <div role="tabpanel" label="Transcription">
            <TranscriptionPanel 
              isRecording={isRecording}
              onRecordingToggle={handleRecordingToggle}
              hasTranscripts={!!transcriptionContent.trim()}
              onGenerateNote={handleGenerateNote}
              transcriptionLanguage={transcriptionLanguage}
              translationLanguage={translationLanguage}
              isTranslating={isTranslating}
              onTranscriptionLanguageChange={setTranscriptionLanguage}
              onTranslationLanguageChange={setTranslationLanguage}
              onTranslationToggle={() => setIsTranslating(prev => !prev)}
            />
          </div>
          <div role="tabpanel" label="AI Assistant">
            <AiAssistant noteContent={transcriptionContent} />
          </div>
        </DraggableSidebar>
      </div>
    </ErrorBoundary>
  );
}

export default TranscriptionPage; 