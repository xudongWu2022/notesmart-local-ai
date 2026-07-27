import { useTranslation } from 'react-i18next';

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-card rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg border border-border-subtle">
        <h3 className="text-lg font-semibold mb-2 text-content-primary">{title}</h3>
        <p className="text-content-secondary mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-content-secondary hover:bg-surface-hover rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
