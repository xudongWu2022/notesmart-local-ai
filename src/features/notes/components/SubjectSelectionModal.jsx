import { useTranslation } from 'react-i18next';

function SubjectSelectionModal({ isOpen, onClose, onSelect }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const subjects = [
    { id: 'math', name: 'Mathematics', icon: '\uD83D\uDCD0' },
    { id: 'science', name: 'Science', icon: '\uD83D\uDD2C' },
    { id: 'history', name: 'History', icon: '\uD83D\uDCDA' },
    { id: 'english', name: 'English', icon: '\u270F\uFE0F' },
    { id: 'computer', name: 'Computer Science', icon: '\uD83D\uDCBB' },
    { id: 'physics', name: 'Physics', icon: '\u26A1' },
    { id: 'chemistry', name: 'Chemistry', icon: '\uD83E\uDDEA' },
    { id: 'biology', name: 'Biology', icon: '\uD83E\uDDEC' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-full max-w-md bg-surface-card rounded-xl shadow-lg border border-border-subtle relative z-10 mx-4">
        <div className="p-6">
          <h3 className="text-lg font-medium leading-6 text-content-primary mb-4">
            Select Subject
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => onSelect(subject.id)}
                className="flex items-center p-4 text-left rounded-xl hover:bg-surface-hover
                  transition-colors border border-border"
              >
                <span className="text-2xl mr-3">{subject.icon}</span>
                <span className="font-medium text-content-primary">{subject.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium
                text-content-secondary hover:bg-surface-hover rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubjectSelectionModal;
