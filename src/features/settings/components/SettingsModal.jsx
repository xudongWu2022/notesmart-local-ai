import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@headlessui/react';
import { FiX, FiMoon, FiSun, FiLock } from 'react-icons/fi';
import { useTheme } from '../../../shared/lib/ThemeContext';
import { defaultModelFor, getAiSettings, saveAiSettings } from '../../../shared/lib/aiSettings';
import { testAiConnection } from '../../../shared/lib/aiClient';

function SettingsModal({ isOpen, onClose }) {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [aiSettings, setAiSettings] = useState(getAiSettings);
  const [aiStatus, setAiStatus] = useState('');
  const [isTestingAi, setIsTestingAi] = useState(false);

  const tabs = [
    { id: 'general', label: t('settings.generalSettings') },
    { id: 'ai', label: 'AI Provider' },
  ];

  useEffect(() => {
    if (isOpen) setAiSettings(getAiSettings());
  }, [isOpen]);

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const updateAiSettings = (updates) => {
    setAiStatus('');
    setAiSettings((current) => ({ ...current, ...updates }));
  };

  const handleProviderChange = (provider) => {
    updateAiSettings({ provider, model: defaultModelFor(provider) });
  };

  const handleSaveAi = () => {
    saveAiSettings(aiSettings);
    setAiStatus('Saved locally in this browser.');
  };

  const handleTestAi = async () => {
    setIsTestingAi(true);
    setAiStatus('');
    try {
      await testAiConnection(aiSettings);
      setAiStatus('Connection successful.');
    } catch (error) {
      setAiStatus(error instanceof Error ? error.message : 'Could not connect to this provider.');
    } finally {
      setIsTestingAi(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

        <div className="relative bg-surface-card rounded-xl shadow-xl max-w-2xl w-full mx-auto border border-border-subtle">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Dialog.Title className="text-xl font-semibold text-content-primary">
              {t('settings.title')}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-hover rounded-full text-content-secondary transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`
                  px-4 py-3 font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-content-secondary hover:text-content-primary'}
                `}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-content-primary">{t('settings.theme')}</h3>
                  <div className="flex space-x-4">
                    <button
                      className={`flex items-center px-4 py-2 rounded-lg border transition-colors
                        ${theme === 'light'
                          ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-600'
                          : 'border-border text-content-secondary hover:bg-surface-hover'}`}
                      onClick={() => theme !== 'light' && toggleTheme()}
                    >
                      <FiSun className="h-5 w-5 mr-2" />
                      {t('settings.light')}
                    </button>
                    <button
                      className={`flex items-center px-4 py-2 rounded-lg border transition-colors
                        ${theme === 'dark'
                          ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-600'
                          : 'border-border text-content-secondary hover:bg-surface-hover'}`}
                      onClick={() => theme !== 'dark' && toggleTheme()}
                    >
                      <FiMoon className="h-5 w-5 mr-2" />
                      {t('settings.dark')}
                    </button>
                  </div>
                </div>

                {/* Language Selection */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-content-primary">{t('settings.language')}</h3>
                  <select
                    value={i18n.language}
                    onChange={handleLanguageChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface-input
                      text-content-primary focus:outline-none focus:border-primary-400
                      focus:ring-1 focus:ring-primary-400 transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                  </select>
                </div>

                {/* Password Change */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-content-primary">{t('settings.changePassword')}</h3>
                  <button className="flex items-center px-4 py-2 rounded-lg border border-border
                    text-content-secondary hover:bg-surface-hover transition-colors">
                    <FiLock className="h-5 w-5 mr-2" />
                    {t('settings.changePassword')}
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'ai' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium mb-1 text-content-primary">Your AI provider</h3>
                  <p className="text-sm text-content-secondary">Keys stay in this browser and are used directly from your local deployment.</p>
                </div>
                <label className="block text-sm font-medium text-content-primary">
                  Provider
                  <select value={aiSettings.provider} onChange={(event) => handleProviderChange(event.target.value)}
                    className="mt-2 w-full px-4 py-2 rounded-lg border border-border bg-surface-input text-content-primary">
                    <option value="openai">OpenAI (recommended)</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="siliconflow">SiliconFlow</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-content-primary">
                  API key
                  <input type="password" autoComplete="off" value={aiSettings.apiKey}
                    onChange={(event) => updateAiSettings({ apiKey: event.target.value })}
                    placeholder="Paste your own API key"
                    className="mt-2 w-full px-4 py-2 rounded-lg border border-border bg-surface-input text-content-primary" />
                </label>
                <label className="block text-sm font-medium text-content-primary">
                  Model
                  <input type="text" value={aiSettings.model}
                    onChange={(event) => updateAiSettings({ model: event.target.value })}
                    className="mt-2 w-full px-4 py-2 rounded-lg border border-border bg-surface-input text-content-primary" />
                </label>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={handleSaveAi} className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Save locally</button>
                  <button type="button" disabled={isTestingAi || !aiSettings.apiKey.trim()} onClick={handleTestAi}
                    className="px-4 py-2 rounded-lg border border-border text-content-secondary hover:bg-surface-hover disabled:opacity-50">
                    {isTestingAi ? 'Testing…' : 'Test connection'}
                  </button>
                </div>
                {aiStatus && <p className="text-sm text-content-secondary break-words" role="status">{aiStatus}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default SettingsModal;
