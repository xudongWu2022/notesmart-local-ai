import { useState } from 'react';
import { updateNote } from '../../../db/db';

export default function NoteAboutPanel({ note, attachments, onDownload, onDelete }) {
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editTranscript, setEditTranscript] = useState('');

  const handleCopyTranscript = async () => {
    try {
      const textToCopy = typeof note.transcript === 'object'
        ? JSON.stringify(note.transcript, null, 2)
        : note.transcript;
      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleStartEditTranscript = () => {
    setIsEditingTranscript(true);
    setEditTranscript(note.transcript);
  };

  const handleSaveTranscript = async () => {
    try {
      await updateNote(note.id, {
        transcript: editTranscript,
        lastModified: new Date().toISOString(),
      });
      setIsEditingTranscript(false);
    } catch (error) {
      console.error('Failed to update transcript:', error);
    }
  };

  return (
    <div className="h-full bg-gradient-note">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          {/* Note Information Card */}
          <div className="glass-card rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <span className="text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <h2 className="text-xl font-semibold text-content-primary">Note Information</h2>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-content-secondary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Created: {new Date(note.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-content-secondary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Last Modified: {new Date(note.lastModified).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Transcript Card */}
          {note.transcript && (
            <div className="glass-card rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-purple-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </span>
                  <h2 className="text-xl font-semibold text-content-primary">Transcript</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyTranscript}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-content-secondary hover:text-content-primary
                             rounded-lg border border-border hover:border-border-subtle
                             bg-surface-card/50 hover:bg-surface-hover transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={handleStartEditTranscript}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-content-secondary hover:text-content-primary
                             rounded-lg border border-border hover:border-border-subtle
                             bg-surface-card/50 hover:bg-surface-hover transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                {isEditingTranscript ? (
                  <textarea
                    value={editTranscript}
                    onChange={(e) => setEditTranscript(e.target.value)}
                    className="w-full h-48 p-3 rounded-lg border border-border
                             bg-surface-input text-content-primary
                             focus:border-primary-400 focus:ring focus:ring-primary-200
                             focus:ring-opacity-50 transition-colors"
                  />
                ) : (
                  <p className="text-content-secondary whitespace-pre-wrap">{note.transcript}</p>
                )}
              </div>
              {isEditingTranscript && (
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setIsEditingTranscript(false);
                      setEditTranscript(note.transcript);
                    }}
                    className="px-4 py-2 text-content-secondary hover:text-content-primary
                             rounded-lg border border-border hover:border-border-subtle
                             bg-surface-card/50 hover:bg-surface-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTranscript}
                    className="px-4 py-2 text-white bg-primary-600 hover:bg-primary-700
                             rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Attachments Card */}
          {attachments && attachments.length > 0 && (
            <div className="glass-card rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-green-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </span>
                  <h2 className="text-xl font-semibold text-content-primary">Attachments</h2>
                </div>
              </div>
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-surface-card/50 rounded-lg">
                    <span className="text-content-secondary">{attachment.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onDownload(attachment)}
                        className="text-blue-500 hover:text-blue-600"
                        aria-label="Download attachment"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(attachment.id)}
                        className="text-red-500 hover:text-red-600"
                        aria-label="Delete attachment"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
