import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
  { code: 'zh', name: '\u4E2D\u6587', flag: '\uD83C\uDDE8\uD83C\uDDF3' },
  { code: 'es', name: 'Espa\u00F1ol', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
  { code: 'fr', name: 'Fran\u00E7ais', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
  { code: 'de', name: 'Deutsch', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
];

function LanguageModal({
  transcriptionLanguage,
  translationLanguage,
  isTranslating,
  onTranscriptionLanguageChange,
  onTranslationLanguageChange,
  onClose,
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-border-subtle w-96">
        <h3 className="text-lg font-semibold mb-4 text-content-primary">
          {t('transcription.selectLanguage')}
        </h3>

        <div className="mb-6">
          <p className="text-sm mb-2 text-content-secondary">Audio Language</p>
          <div className="flex gap-2 flex-wrap">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`flex items-center gap-2 p-2 border rounded-lg transition ${
                  transcriptionLanguage === lang.code
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-border text-content-secondary hover:bg-surface-hover'
                }`}
                onClick={() => onTranscriptionLanguageChange(lang.code)}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {isTranslating && (
          <div className="mb-6">
            <p className="text-sm mb-2 text-content-secondary">Translation Language</p>
            <div className="flex gap-2 flex-wrap">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`flex items-center gap-2 p-2 border rounded-lg transition ${
                    translationLanguage === lang.code
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-border text-content-secondary hover:bg-surface-hover'
                  }`}
                  onClick={() => onTranslationLanguageChange(lang.code)}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          className="mt-4 w-full p-2 rounded-lg text-content-secondary
            hover:bg-surface-hover border border-border transition-colors"
          onClick={onClose}
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
}

export default LanguageModal;
