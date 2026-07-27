import { useTranslation } from 'react-i18next';

const ProgressBar = ({ progress, status }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-card rounded-xl p-8 w-96 shadow-lg border border-border-subtle">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-content-primary">{status}</span>
          <span className="text-lg font-bold text-primary-600">{progress}%</span>
        </div>

        <div className="w-full bg-primary-100 rounded-full h-4 mb-4">
          <div
            className="bg-primary-600 h-4 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-content-secondary text-center">
          {t('transcription.processing')}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
