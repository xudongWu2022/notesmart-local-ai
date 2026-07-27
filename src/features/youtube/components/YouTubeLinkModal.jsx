import { useState } from 'react';
import _Modal from '../../../shared/components/ui/Modal';
import { youtubeService } from '../services/youtubeService';
import { FiYoutube, FiX, FiFileText, FiLoader, FiLink2 } from 'react-icons/fi';

function YouTubeLinkModal({ isOpen, onClose, onSubmit }) {
  const [youtubeLink, setYoutubeLink] = useState('');
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);
    try {
      const result = await youtubeService.processYouTubeVideo(youtubeLink, title);
      onSubmit(result);
      onClose();
    } catch (error) {
      console.error('Error processing YouTube video:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Could not create a note from this video.');
      // TODO: 显示错误提示
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = (e) => {
    e.preventDefault();
    if (!isProcessing) {
      setYoutubeLink('');
      setTitle('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50"
         onClick={(e) => e.target === e.currentTarget && handleClose(e)}>
      <div className="bg-surface-card backdrop-blur-xl rounded-xl p-8 w-full max-w-md
                   shadow-lg border border-border-subtle
                   transform transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 
                         flex items-center justify-center ring-1 ring-red-500/20">
              <FiYoutube className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold bg-gradient-to-br from-red-600 to-red-500 
                          bg-clip-text text-transparent">
                Add YouTube Video
              </h2>
              <p className="text-sm text-content-secondary mt-0.5">
                Create notes from YouTube content
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-red-50 rounded-xl transition-colors duration-200 
                     group disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            <FiX className="w-5 h-5 text-gray-400 group-hover:text-red-500 
                         transition-colors duration-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{errorMessage}</p>}
          {/* YouTube Link Input */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-content-secondary">
              <FiLink2 className="w-4 h-4 mr-1.5 text-red-500" />
              YouTube Link
            </label>
            <div className="relative group">
              <input
                type="url"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                className="w-full px-4 py-3 bg-surface-input border border-border rounded-xl
                        focus:ring-2 focus:ring-red-500 focus:border-transparent
                        placeholder:text-gray-400 text-sm transition-all duration-200
                        hover:bg-surface-hover pr-10"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <FiYoutube className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 
                                 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
            </div>
          </div>
          
          {/* Title Input */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-content-secondary">
              <FiFileText className="w-4 h-4 mr-1.5 text-red-500" />
              Note Title
            </label>
            <div className="relative group">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-surface-input border border-border rounded-xl
                        focus:ring-2 focus:ring-red-500 focus:border-transparent
                        placeholder:text-gray-400 text-sm transition-all duration-200
                        hover:bg-surface-hover"
                placeholder="Enter note title or leave empty for video title"
              />
            </div>
            <p className="text-xs text-content-tertiary ml-5">
              Leave empty to use the video title
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium text-content-secondary
                     transition-all duration-200 rounded-xl
                     hover:bg-surface-hover hover:text-content-primary
                     focus:ring-2 focus:ring-primary-200 focus:ring-offset-1
                     disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:bg-transparent disabled:hover:text-content-secondary"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !youtubeLink}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium
                       transform transition-all duration-200
                       flex items-center space-x-2 min-w-[120px] justify-center
                       ${isProcessing || !youtubeLink
                         ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                         : 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-red-500/25 shadow-lg hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5'
                       }`}
            >
              {isProcessing ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Processing</span>
                </>
              ) : (
                <>
                  <FiYoutube className="w-4 h-4" />
                  <span>Create Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default YouTubeLinkModal; 
