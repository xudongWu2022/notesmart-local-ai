import { FiEdit2, FiDownload, FiArrowLeft, FiCheck } from 'react-icons/fi';

export default function NoteDetailHeader({
  note,
  isEditing,
  onNavigateBack,
  onSave,
  onEdit,
  onExport,
}) {
  return (
    <header className="bg-surface-card/80 backdrop-blur-xl border-b border-border-subtle shadow-sm">
      <div className="max-w-[1920px] mx-auto px-2 sm:px-3">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateBack}
              className="group flex items-center gap-2 px-3.5 py-2.5 rounded-xl
                       text-content-secondary hover:text-blue-600
                       bg-surface-card hover:bg-blue-50/80 dark:hover:bg-blue-900/20
                       border border-border-subtle hover:border-blue-200/80 dark:hover:border-blue-800/50
                       shadow-sm hover:shadow-md
                       transform hover:-translate-y-0.5
                       transition-all duration-300 ease-out"
              aria-label="Go back"
            >
              <FiArrowLeft className="w-4.5 h-4.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
              <span className="text-sm font-medium tracking-wide pr-0.5">Back</span>
            </button>

            <h1 className="text-xl font-semibold">
              <span className="text-content-primary truncate">
                {note.title}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <button
                onClick={onSave}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl
                         text-white
                         bg-primary-600 hover:bg-primary-700
                         shadow-sm hover:shadow-md
                         transform hover:-translate-y-0.5
                         transition-all duration-300 ease-out
                         relative overflow-hidden"
              >
                <FiCheck className="w-4 h-4 transition-transform duration-300
                                  group-hover:scale-110 relative z-10" />
                <span className="font-medium tracking-wide relative z-10">Save</span>
              </button>
            ) : (
              <button
                onClick={onEdit}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl
                         text-content-secondary hover:text-blue-600
                         bg-surface-card hover:bg-surface-hover
                         border border-border-subtle hover:border-blue-200/80 dark:hover:border-blue-800/50
                         shadow-sm hover:shadow-md
                         transform hover:-translate-y-0.5
                         transition-all duration-300 ease-out
                         relative overflow-hidden"
              >
                <FiEdit2 className="w-4 h-4 transition-transform duration-300
                                  group-hover:scale-110 relative z-10" />
                <span className="font-medium tracking-wide relative z-10">Edit</span>
              </button>
            )}

            <button
              onClick={onExport}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl
                       text-content-secondary hover:text-purple-600
                       bg-surface-card hover:bg-surface-hover
                       border border-border-subtle hover:border-purple-200/80 dark:hover:border-purple-800/50
                       shadow-sm hover:shadow-md
                       transform hover:-translate-y-0.5
                       transition-all duration-300 ease-out
                       relative overflow-hidden"
            >
              <FiDownload className="w-4 h-4 transition-transform duration-300
                                 group-hover:scale-110 relative z-10" />
              <span className="font-medium tracking-wide relative z-10">Export</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
