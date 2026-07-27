import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../features/auth/AuthContext';
import {
  FiHome,
  FiGrid,
  FiLogOut,
  FiLogIn,
  FiFolder,
  FiBookOpen,
  FiGlobe,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import { useTheme } from '../../lib/ThemeContext';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [_mobileMenuOpen, _setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface-bg/95 backdrop-blur-xl border-b border-border-subtle shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex">
            <Link to="/" className="group flex-shrink-0 flex items-center gap-2">
              <FiBookOpen className="w-6 h-6 text-primary-600 group-hover:text-primary-500 transition-colors duration-300" />
              <span className="text-2xl font-bold bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500
                             bg-clip-text text-transparent group-hover:from-indigo-500
                             group-hover:via-blue-500 group-hover:to-blue-400
                             transition-all duration-300 font-display tracking-tight">
                NoteSmart
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-10">
              <Link
                to="/"
                className={`group relative px-3 py-2 flex items-center space-x-2.5
                        ${isActive('/') ? 'text-primary-600' : 'text-content-secondary'}`}
              >
                <div className={`absolute inset-0 rounded-lg bg-primary-50/0
                              group-hover:bg-primary-50/80 dark:group-hover:bg-primary-900/30 transition-colors duration-300
                              ${isActive('/') ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`} />
                <FiHome className={`w-[18px] h-[18px] relative z-10 transition-colors duration-300
                              ${isActive('/') ? 'text-primary-600' : 'text-content-tertiary group-hover:text-primary-500'}`} />
                <span className="text-[13px] relative z-10 font-medium tracking-wide
                             group-hover:text-primary-600 transition-colors duration-300">
                  {t('nav.home')}
                </span>
                <div className={`absolute bottom-0 left-0 right-0 mx-auto w-8 h-0.5 rounded-full
                              bg-primary-500/80 scale-x-0 group-hover:scale-x-100
                              transition-transform duration-300 ease-out
                              ${isActive('/') ? 'scale-x-100' : ''}`} />
              </Link>

              <Link
                to="/dashboard"
                className={`group relative px-3 py-2 flex items-center space-x-2.5
                        ${isActive('/dashboard') ? 'text-primary-600' : 'text-content-secondary'}`}
              >
                <div className={`absolute inset-0 rounded-lg bg-primary-50/0
                              group-hover:bg-primary-50/80 dark:group-hover:bg-primary-900/30 transition-colors duration-300
                              ${isActive('/dashboard') ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`} />
                <FiGrid className={`w-[18px] h-[18px] relative z-10 transition-colors duration-300
                              ${isActive('/dashboard') ? 'text-primary-600' : 'text-content-tertiary group-hover:text-primary-500'}`} />
                <span className="text-[13px] relative z-10 font-medium tracking-wide
                             group-hover:text-primary-600 transition-colors duration-300">
                  {t('nav.dashboard')}
                </span>
                <div className={`absolute bottom-0 left-0 right-0 mx-auto w-8 h-0.5 rounded-full
                              bg-primary-500/80 scale-x-0 group-hover:scale-x-100
                              transition-transform duration-300 ease-out
                              ${isActive('/dashboard') ? 'scale-x-100' : ''}`} />
              </Link>

              {isAuthenticated && (
                <Link
                  to="/folders"
                  className={`group relative px-3 py-2 flex items-center space-x-2.5
                            ${isActive('/folders') ? 'text-primary-600' : 'text-content-secondary'}`}
                >
                  <div className={`absolute inset-0 rounded-lg bg-primary-50/0
                                group-hover:bg-primary-50/80 dark:group-hover:bg-primary-900/30 transition-colors duration-300
                                ${isActive('/folders') ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`} />
                  <FiFolder className={`w-[18px] h-[18px] relative z-10 transition-colors duration-300
                                   ${isActive('/folders') ? 'text-primary-600' : 'text-content-tertiary group-hover:text-primary-500'}`} />
                  <span className="text-[13px] relative z-10 font-medium tracking-wide
                               group-hover:text-primary-600 transition-colors duration-300">
                    {t('nav.folders')}
                  </span>
                  <div className={`absolute bottom-0 left-0 right-0 mx-auto w-8 h-0.5 rounded-full
                                bg-primary-500/80 scale-x-0 group-hover:scale-x-100
                                transition-transform duration-300 ease-out
                                ${isActive('/folders') ? 'scale-x-100' : ''}`} />
                </Link>
              )}
            </div>
          </div>

          {/* Right Side — Language + Auth */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       text-content-secondary hover:bg-surface-hover transition-colors duration-200"
              aria-label="Switch language"
            >
              <FiGlobe className="w-4 h-4" />
              <span className="text-xs font-medium">{i18n.language === 'en' ? 'EN' : '中'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       text-content-secondary hover:bg-surface-hover transition-colors duration-200"
              aria-label={theme === 'dark' ? t('settings.light') : t('settings.dark')}
            >
              {theme === 'dark'
                ? <FiSun className="w-4 h-4" />
                : <FiMoon className="w-4 h-4" />}
            </button>

            {/* Auth Button */}
            <button
              onClick={logout}
              className="group relative px-5 py-2 rounded-xl overflow-hidden
                       transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500
                            group-hover:from-primary-500 group-hover:to-primary-400
                            transition-colors duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20
                            bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)]" />
              <span className="relative z-10 text-[13px] font-medium text-white
                           flex items-center gap-2">
                <FiLogOut className="w-[18px] h-[18px]" />
                <span>{t('nav.logout')}</span>
              </span>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1.5">
              <Link
                to="/"
                className={`group flex items-center space-x-3 px-4 py-2.5 rounded-xl
                         ${isActive('/') ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'text-content-secondary'}
                         hover:bg-primary-50/80 dark:hover:bg-primary-900/20 transition-all duration-300`}
              >
                <FiHome className="w-[18px] h-[18px]" />
                <span className="text-[13px] font-medium">{t('nav.home')}</span>
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className={`group flex items-center space-x-3 px-4 py-2.5 rounded-xl
                             ${isActive('/dashboard') ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'text-content-secondary'}
                             hover:bg-primary-50/80 dark:hover:bg-primary-900/20 transition-all duration-300`}
                  >
                    <FiGrid className="w-[18px] h-[18px]" />
                    <span className="text-[13px] font-medium">{t('nav.dashboard')}</span>
                  </Link>

                  <Link
                    to="/folders"
                    className={`group flex items-center space-x-3 px-4 py-2.5 rounded-xl
                             ${isActive('/folders') ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'text-content-secondary'}
                             hover:bg-primary-50/80 dark:hover:bg-primary-900/20 transition-all duration-300`}
                  >
                    <FiFolder className="w-[18px] h-[18px]" />
                    <span className="text-[13px] font-medium">{t('nav.folders')}</span>
                  </Link>
                </>
              )}

              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-content-secondary
                       hover:bg-primary-50/80 dark:hover:bg-primary-900/20 transition-all duration-300"
              >
                {theme === 'dark'
                  ? <FiSun className="w-4 h-4" />
                  : <FiMoon className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {theme === 'dark' ? t('settings.light') : t('settings.dark')}
                </span>
              </button>

              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-content-secondary
                         hover:bg-primary-50/80 dark:hover:bg-primary-900/20 transition-all duration-300"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('nav.logout')}</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-3 px-4 py-2.5 text-content-secondary
                         hover:bg-primary-50/80 dark:hover:bg-primary-900/20 transition-all duration-300"
                >
                  <FiLogIn className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('nav.login')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
