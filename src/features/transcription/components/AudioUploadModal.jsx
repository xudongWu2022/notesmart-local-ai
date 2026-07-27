import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiMusic, FiGlobe } from 'react-icons/fi';
import ProgressBar from '../../../shared/components/ui/ProgressBar';

function AudioUploadModal({ isOpen, onClose, onUpload }) {
  const [audioFile, setAudioFile] = useState(null);
  const [noteLanguage, setNoteLanguage] = useState('en');
  const [audioLanguage, setAudioLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!audioFile) return;
    
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('audioLanguage', audioLanguage);
    formData.append('noteLanguage', noteLanguage);
    formData.append('title', title.trim());
    
    setIsLoading(true);
    await onUpload(formData);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      {!isLoading ? (
        <div className="bg-surface-card backdrop-blur-xl rounded-xl p-8 w-full max-w-md
                     shadow-lg border border-border-subtle
                     transform transition-all duration-300">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 
                        bg-clip-text text-transparent">
              Upload Audio
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-full transition-colors duration-200"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Title Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-content-secondary mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title or leave empty for AI generated title"
              className="w-full px-4 py-3 bg-surface-input border border-border rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      placeholder:text-gray-400 text-sm transition-all duration-200
                      hover:bg-surface-hover"
            />
          </div>

          {/* Language Selection */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="flex items-center text-sm font-medium text-content-secondary mb-2">
                <FiMusic className="w-4 h-4 mr-1.5 text-blue-500" />
                Audio Language
              </label>
              <select
                value={audioLanguage}
                onChange={(e) => setAudioLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-surface-input border border-border rounded-xl
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        text-sm transition-all duration-200
                        hover:bg-surface-hover"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-content-secondary mb-2">
                <FiGlobe className="w-4 h-4 mr-1.5 text-blue-500" />
                Note Language
              </label>
              <select
                value={noteLanguage}
                onChange={(e) => setNoteLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-surface-input border border-border rounded-xl
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        text-sm transition-all duration-200
                        hover:bg-surface-hover"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center
                     hover:border-blue-400 transition-all duration-300
                     bg-gradient-to-b from-gray-50/50 to-white/30 backdrop-blur-sm
                     group cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith('audio/')) {
                setAudioFile(file);
              }
            }}
          >
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setAudioFile(file);
                }
              }}
              id="audio-upload"
            />
            <label
              htmlFor="audio-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {audioFile ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4
                               group-hover:bg-blue-100 transition-colors duration-200">
                    <FiMusic className="w-8 h-8 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-content-primary">{audioFile.name}</span>
                  <span className="text-xs text-content-tertiary mt-2">
                    Click to change file
                  </span>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4
                               group-hover:bg-blue-100 transition-colors duration-200">
                    <FiUpload className="w-8 h-8 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-content-primary">
                    Drag & drop or click to upload audio file
                  </span>
                  <span className="text-xs text-content-tertiary mt-2">
                    Supports MP3, WAV, M4A
                  </span>
                </>
              )}
            </label>
          </div>
          
          {/* Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-content-secondary
                     transition-colors duration-200 rounded-xl hover:bg-surface-hover hover:text-content-primary"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={!audioFile}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium text-white
                       transform transition-all duration-200 shadow-sm
                       ${!audioFile 
                         ? 'bg-gray-300 cursor-not-allowed' 
                         : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 hover:-translate-y-0.5 hover:shadow-md'
                       }`}
            >
              Upload
            </button>
          </div>
        </div>
      ) : (
        <ProgressBar progress={0} status="Processing audio..." />
      )}
    </div>
  );
}

export default AudioUploadModal; 