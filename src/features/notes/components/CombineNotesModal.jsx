import { useTranslation } from 'react-i18next';

export default function CombineNotesModal({
  noteTitle,
  availableNotes,
  selectedNoteId,
  isCombining,
  onNoteSelect,
  onCombine,
  onClose,
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-card rounded-xl shadow-lg border border-border-subtle max-w-3xl w-full mx-4">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-content-primary">{t('notes.combineNotes')}</h2>
          <p className="mt-1 text-sm text-content-secondary">
            {t('notes.selectNotes')} &quot;{noteTitle}&quot;
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
            {availableNotes.map((availableNote) => (
              <div
                key={availableNote.id}
                onClick={() => onNoteSelect(availableNote.id)}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${
                  selectedNoteId === availableNote.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-sm'
                    : 'border-border hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/50 dark:hover:bg-primary-900/20'
                }`}
              >
                <h3 className="font-medium text-content-primary">{availableNote.title}</h3>
                <div className="mt-2 flex items-center gap-4 text-sm text-content-secondary">
                  <span>Created: {new Date(availableNote.date).toLocaleDateString()}</span>
                  {availableNote.subject && (
                    <span>Subject: {availableNote.subject}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-surface-elevated flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-content-secondary hover:bg-surface-hover rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onCombine}
            disabled={!selectedNoteId || isCombining}
            className={`px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2 transition-all ${
              !selectedNoteId || isCombining
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-primary-700 hover:shadow-md'
            }`}
          >
            {isCombining ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Combining...</span>
              </>
            ) : (
              t('notes.combineNotes')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
