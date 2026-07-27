import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSettings } from 'react-icons/fi';
import { useAuth } from '../../../features/auth/AuthContext';
import SettingsModal from '../../../features/settings/components/SettingsModal';
import BillingModal from '../../../features/billing/components/BillingModal';

export default function SidebarFooter({ isOpen }) {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const settingsMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="border-t border-border-subtle p-3
        bg-gradient-to-b from-surface-card/50 to-surface-elevated/30
        backdrop-blur-sm relative"
      >
        <button
          className="flex items-center w-full px-3 py-2.5 rounded-xl
            transition-all duration-200 group
            text-content-secondary hover:bg-surface-hover hover:text-content-primary"
          onClick={() => setShowSettingsMenu(!showSettingsMenu)}
        >
          <FiSettings className={`h-5 w-5 transition-transform duration-200
            group-hover:rotate-45 ${isOpen ? 'mr-3' : ''}`} />
          {isOpen && (
            <span className="text-sm font-medium">{t('nav.settings')}</span>
          )}
        </button>

        {showSettingsMenu && (
          <div
            ref={settingsMenuRef}
            className="absolute bottom-16 left-0 w-full bg-surface-card/95 backdrop-blur-sm
              border-t border-border-subtle rounded-t-xl shadow-xl py-1.5
              transform transition-all duration-200"
          >
            <button
              onClick={() => {
                setShowSettings(true);
                setShowSettingsMenu(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-hover text-content-secondary"
            >
              {t('nav.settings')}
            </button>
            <button
              onClick={() => {
                setShowBilling(true);
                setShowSettingsMenu(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-hover text-content-secondary"
            >
              {t('settings.billing')}
            </button>
            <div className="h-px bg-border-subtle my-1" />
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50
                dark:hover:bg-red-900/20 text-red-600"
            >
              {t('nav.logout')}
            </button>
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showBilling && (
        <BillingModal
          isOpen={showBilling}
          onClose={() => setShowBilling(false)}
        />
      )}
    </>
  );
}
