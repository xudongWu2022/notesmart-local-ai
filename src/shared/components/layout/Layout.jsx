import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMenu } from 'react-icons/fi';
import Sidebar from './Sidebar';

function Layout({ children }) {
  const { t } = useTranslation();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (window.innerWidth < 768) return false;
    const saved = localStorage.getItem('sidebar-open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Persist sidebar state (desktop only)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-open', JSON.stringify(isSidebarOpen));
    }
  }, [isSidebarOpen, isMobile]);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div className="flex h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
      />

      {/* Mobile hamburger menu */}
      {isMobile && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 rounded-lg
            bg-surface-card/95 backdrop-blur-sm border border-border-subtle
            shadow-sm text-content-secondary hover:text-content-primary
            transition-all duration-200"
          aria-label={t('sidebar.openMenu')}
        >
          <FiMenu className="w-5 h-5" />
        </button>
      )}

      <main
        className={`
          flex-1 overflow-auto transition-all duration-300
          bg-surface-bg
          ${isMobile ? 'ml-0' : isSidebarOpen ? 'md:ml-64' : 'md:ml-16'}
        `}
      >
        {children}
      </main>
    </div>
  );
}

export default Layout;
