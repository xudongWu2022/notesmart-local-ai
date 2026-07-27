import { useTranslation } from 'react-i18next';

export default function DeleteConfirmDialog({ onConfirm, onCancel }) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-border-subtle max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-content-primary">{t('notes.deleteConfirmTitle')}</h3>
        <p className="text-content-secondary mb-6">
          {t('notes.deleteConfirmMessage')}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-content-secondary hover:bg-surface-hover rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
