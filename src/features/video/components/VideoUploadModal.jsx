import { useState } from 'react';
import { FiUpload, FiX, FiVideo, FiLoader, FiCheck } from 'react-icons/fi';
import { videoService } from '../services/videoService';

function VideoUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setFile(file);
      setError('');
    } else {
      setError('Please select a valid video file');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      await videoService.uploadVideo(file, (progress) => {
        setProgress(progress);
      });
      onUploadSuccess();
      onClose();
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md
                   shadow-[0_8px_32px_rgb(0,0,0,0.12)] border border-white/20
                   transform transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 
                         flex items-center justify-center ring-1 ring-blue-500/20">
              <FiVideo className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold bg-gradient-to-br from-blue-600 to-blue-500 
                          bg-clip-text text-transparent">
                Upload Video
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Supported formats: MP4, MOV, AVI
              </p>
            </div>
          </div>
          <button
            onClick={() => !uploading && onClose()}
            className="p-2 hover:bg-blue-50 rounded-xl transition-colors duration-200 
                     group disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploading}
          >
            <FiX className="w-5 h-5 text-gray-400 group-hover:text-blue-500 
                         transition-colors duration-200" />
          </button>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-200
                   ${dragActive 
                     ? 'border-blue-500 bg-blue-50/50' 
                     : 'border-gray-200 bg-gray-50/50 hover:border-blue-500/50'
                   } ${file ? 'border-green-500 bg-green-50/50' : ''}`}
        >
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
            id="video-upload"
            disabled={uploading}
          />
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            {uploading ? (
              <>
                <FiLoader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Uploading... {Math.round(progress)}%
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </>
            ) : file ? (
              <>
                <FiCheck className="w-12 h-12 text-green-500 mb-4" />
                <span className="text-sm font-medium text-gray-700">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500 mt-2">
                  Click to change file
                </span>
              </>
            ) : (
              <>
                <FiUpload className="w-12 h-12 text-blue-500 mb-4 
                                 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium text-gray-700">
                  Drag & drop or click to upload video
                </span>
                <span className="text-xs text-gray-500 mt-2">
                  Maximum file size: 500MB
                </span>
              </>
            )}
          </label>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-500 text-center">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={() => !uploading && onClose()}
            className="px-5 py-2.5 text-sm font-medium text-gray-600
                   transition-all duration-200 rounded-xl 
                   hover:bg-gray-100 hover:text-gray-900
                   disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium text-white
                     transform transition-all duration-200
                     flex items-center space-x-2
                     ${!file || uploading
                       ? 'bg-gray-300 cursor-not-allowed' 
                       : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 hover:-translate-y-0.5 hover:shadow-lg'
                     }`}
          >
            <FiUpload className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoUploadModal; 