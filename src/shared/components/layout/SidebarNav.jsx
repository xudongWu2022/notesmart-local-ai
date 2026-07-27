import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiFileText } from 'react-icons/fi';

const MENU_ITEMS = [
  { id: 'dashboard', icon: FiGrid, labelKey: 'nav.dashboard', path: '/dashboard' },
  { id: 'notes', icon: FiFileText, labelKey: 'nav.allNotes', path: '/notes' },
];

export default function SidebarNav({ isOpen, slideAnimation }) {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="px-3 py-4 space-y-1">
      {isOpen && (
        <div className={`text-xs font-medium text-content-tertiary px-3 mb-2
          uppercase tracking-wider transition-all duration-300 ${slideAnimation}`}>
          {t('sidebar.menu')}
        </div>
      )}
      {MENU_ITEMS.map((item) => (
        <Link
          key={item.id}
          to={item.path}
          className={`
            flex items-center px-3 py-2.5 rounded-xl
            transition-all duration-200 group
            ${location.pathname === item.path
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 shadow-sm'
              : 'text-content-secondary hover:bg-surface-hover hover:text-content-primary'
            }
            ${!isOpen && 'justify-center'}
          `}
        >
          <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200
            group-hover:scale-110 ${isOpen && 'mr-3'}`} />
          {isOpen && (
            <span className={`text-sm font-medium transition-all duration-300 ${slideAnimation}`}>
              {t(item.labelKey)}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
