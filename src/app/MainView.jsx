import React, { useState } from 'react';
import NoteView from '../features/notes/components/NoteView';
import TranscriptionView from '../features/transcription/components/TranscriptionView';

function MainView() {
  const [mode, setMode] = useState('note');

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'note' ? 'transcription' : 'note'));
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleMode}
          className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
        >
          切换到{mode === 'note' ? '字幕模式' : '笔记模式'}
        </button>
      </div>

      {mode === 'note' ? <NoteView /> : <TranscriptionView />}
    </div>
  );
}

export default MainView;
