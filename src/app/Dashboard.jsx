import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from '../shared/components/ui/ErrorBoundary';
import LiveTranscription from '../features/transcription/components/LiveTranscription';
import SubjectSelectionModal from '../features/notes/components/SubjectSelectionModal';
import SettingsModal from '../features/settings/components/SettingsModal';
import AudioUploadModal from '../features/transcription/components/AudioUploadModal';
import ProgressBar from '../shared/components/ui/ProgressBar';
import YouTubeLinkModal from '../features/youtube/components/YouTubeLinkModal';
import InputOptionsGrid from './components/InputOptionsGrid';
import RecentNotesList from './components/RecentNotesList';
import DocumentUploadModal from './components/DocumentUploadModal';
import { useDashboard } from './hooks/useDashboard';
import { motion } from 'framer-motion';
import { FiFileText, FiTrendingUp, FiCalendar } from 'react-icons/fi';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function Dashboard() {
  const { t, i18n } = useTranslation();
  const {
    navigate,
    stats,
    showSubjectModal,
    setShowSubjectModal,
    showLiveTranscription,
    setShowLiveTranscription,
    showSettings,
    setShowSettings,
    isProcessing,
    recentNotes,
    showAudioUpload,
    setShowAudioUpload,
    progress,
    progressStatus,
    showProgress,
    showYouTubeModal,
    setShowYouTubeModal,
    showDocumentModal,
    setShowDocumentModal,
    documentLanguage,
    setDocumentLanguage,
    noteLanguage,
    setNoteLanguage,
    languages,
    handleSubjectSelect,
    handleInputSelect,
    handleAudioUpload,
    handleYouTubeSubmit,
    handleFileUpload,
  } = useDashboard();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning');
    if (hour < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  }, [t]);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [i18n.language]);

  const memberSinceFormatted = useMemo(() => {
    if (!stats.memberSince) return '—';
    return new Date(stats.memberSince).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      year: 'numeric',
    });
  }, [stats.memberSince, i18n.language]);

  const statCards = [
    {
      label: t('dashboard.stats.totalNotes'),
      value: stats.totalNotes,
      icon: FiFileText,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      label: t('dashboard.stats.thisWeek'),
      value: stats.thisWeek,
      icon: FiTrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
    {
      label: t('dashboard.stats.memberSince'),
      value: memberSinceFormatted,
      icon: FiCalendar,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/30',
    },
  ];

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-custom"
      >
        <div className="max-w-7xl mx-auto py-8 md:py-10 px-4 sm:px-6 lg:px-8">
          {!showLiveTranscription ? (
            <motion.div variants={container} initial="hidden" animate="show">
              {/* Welcome Section */}
              <motion.div variants={item} className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-900 to-primary-700
                  dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                  {greeting}
                </h1>
                <p className="mt-1.5 text-content-secondary text-sm sm:text-base">
                  {t('dashboard.subtitle')}
                  <span className="text-content-tertiary ml-2 hidden sm:inline">{formattedDate}</span>
                </p>
              </motion.div>

              {/* Stats Overview */}
              <motion.div variants={item} className="grid grid-cols-3 gap-4 mb-10">
                {statCards.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 p-4 rounded-xl
                      bg-surface-card/80 backdrop-blur border border-border-subtle
                      hover:shadow-md transition-shadow duration-200"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-bold text-content-primary leading-tight">{stat.value}</p>
                      <p className="text-xs text-content-tertiary truncate">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={item}>
                <InputOptionsGrid onSelect={handleInputSelect} />
              </motion.div>

              {/* Recent Notes */}
              <motion.div variants={item}>
                <RecentNotesList
                  notes={recentNotes}
                  onNoteClick={(id) => navigate(`/notes/${id}`)}
                />
              </motion.div>
            </motion.div>
          ) : (
            <LiveTranscription onClose={() => setShowLiveTranscription(false)} />
          )}
        </div>

        <SubjectSelectionModal
          isOpen={showSubjectModal}
          onClose={() => setShowSubjectModal(false)}
          onSelect={handleSubjectSelect}
        />

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {showProgress && (
          <ProgressBar progress={progress} status={progressStatus} />
        )}

        <AudioUploadModal
          isOpen={showAudioUpload}
          onClose={() => setShowAudioUpload(false)}
          onUpload={handleAudioUpload}
        />

        <YouTubeLinkModal
          isOpen={showYouTubeModal}
          onClose={() => setShowYouTubeModal(false)}
          onSubmit={handleYouTubeSubmit}
        />

        {showDocumentModal && (
          <DocumentUploadModal
            isProcessing={isProcessing}
            documentLanguage={documentLanguage}
            noteLanguage={noteLanguage}
            languages={languages}
            onDocumentLanguageChange={setDocumentLanguage}
            onNoteLanguageChange={setNoteLanguage}
            onFileUpload={handleFileUpload}
            onClose={() => setShowDocumentModal(false)}
          />
        )}
      </motion.div>
    </ErrorBoundary>
  );
}

export default Dashboard;
