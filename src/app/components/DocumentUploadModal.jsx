import { FiUpload, FiFile, FiX, FiLoader, FiGlobe } from 'react-icons/fi';

export default function DocumentUploadModal({
  isProcessing,
  documentLanguage,
  noteLanguage,
  languages,
  onDocumentLanguageChange,
  onNoteLanguageChange,
  onFileUpload,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-surface-card backdrop-blur-xl rounded-xl p-8 w-full max-w-md
                     shadow-lg border border-border-subtle
                     transform transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10
                           flex items-center justify-center ring-1 ring-green-500/20">
              <FiFile className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold bg-gradient-to-br from-green-600 to-green-500
                            bg-clip-text text-transparent">
                Upload Document
              </h2>
              <p className="text-sm text-content-secondary mt-0.5">
                PDF, PPT, WORD, EXCEL, CSV, TXT
              </p>
            </div>
          </div>
          <button
            onClick={() => !isProcessing && onClose()}
            className="p-2 hover:bg-green-50 rounded-xl transition-colors duration-200
                     group disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            <FiX className="w-5 h-5 text-gray-400 group-hover:text-green-500
                         transition-colors duration-200" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-content-secondary">
              <FiGlobe className="w-4 h-4 mr-1.5 text-green-500" />
              Document Language
            </label>
            <select
              value={documentLanguage}
              onChange={(e) => onDocumentLanguageChange(e.target.value)}
              className="w-full px-3 py-2 bg-surface-input border border-border rounded-xl
                      focus:ring-2 focus:ring-green-500 focus:border-transparent
                      text-sm transition-all duration-200"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-content-secondary">
              <FiGlobe className="w-4 h-4 mr-1.5 text-green-500" />
              Note Language
            </label>
            <select
              value={noteLanguage}
              onChange={(e) => onNoteLanguageChange(e.target.value)}
              className="w-full px-3 py-2 bg-surface-input border border-border rounded-xl
                      focus:ring-2 focus:ring-green-500 focus:border-transparent
                      text-sm transition-all duration-200"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-border rounded-xl p-8
                       hover:border-green-500/50 transition-colors duration-200
                       bg-surface-elevated/50 cursor-pointer group">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) onFileUpload(file);
            }}
            id="document-upload"
            disabled={isProcessing}
          />
          <label
            htmlFor="document-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            {isProcessing ? (
              <>
                <FiLoader className="w-12 h-12 text-green-500 animate-spin mb-4" />
                <span className="text-sm font-medium text-content-secondary">Processing document...</span>
              </>
            ) : (
              <>
                <FiUpload className="w-12 h-12 text-green-500 mb-4
                                 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium text-content-secondary">
                  Drag &amp; drop or click to upload document
                </span>
                <span className="text-xs text-content-tertiary mt-2">
                  Supports multiple formats
                </span>
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}
