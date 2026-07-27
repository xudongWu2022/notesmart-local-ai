import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export default function RecentNotesList({ notes, onNoteClick }) {
  const { t } = useTranslation();

  if (notes.length === 0) {
    return (
      <motion.div
        className="p-16 rounded-xl bg-gradient-to-br from-surface-elevated/90 to-surface-card/90
          backdrop-blur-xl border border-border-subtle text-center"
      >
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="inline-block text-7xl mb-6"
        >
          &#10024;
        </motion.div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-content-primary to-content-secondary
          bg-clip-text text-transparent mb-3">
          {t('dashboard.emptyTitle')}
        </h3>
        <p className="text-content-secondary max-w-md mx-auto">
          {t('dashboard.emptySubtitle')}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-content-primary">
            {t('dashboard.recentNotes')}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent hidden sm:block w-24" />
        </div>
        <Link
          to="/notes"
          className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400
            hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
        >
          {t('dashboard.viewAll')}
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => onNoteClick(note.id)}
            className="group/card relative cursor-pointer isolate"
          >
            <div className="relative p-6 rounded-xl bg-surface-card/90
              backdrop-blur-xl border border-border-subtle
              group-hover/card:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]
              dark:group-hover/card:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]
              transition-all duration-300 group-hover/card:-translate-y-1"
            >
              <div className="absolute -z-10 inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50
                dark:from-blue-900/20 dark:to-purple-900/20 opacity-0 group-hover/card:opacity-100
                transition-opacity rounded-xl pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-content-primary
                      line-clamp-2 group-hover/card:text-primary-600 dark:group-hover/card:text-primary-400
                      transition-colors">
                      {note.title}
                    </h3>
                    <p className="text-sm text-content-secondary mt-1">
                      {new Date(note.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="flex-shrink-0 ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {note.type || 'Note'}
                  </span>
                </div>

                <p className="text-sm text-content-secondary line-clamp-3">
                  {stripHtml(note.content)?.substring(0, 150)}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                  <div className="flex items-center space-x-4 text-sm text-content-tertiary">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {note.duration ? `${Math.round(note.duration / 60)}min` : 'N/A'}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      {note.noteLanguage?.toUpperCase() || 'EN'}
                    </span>
                  </div>

                  <div className="flex items-center opacity-0 group-hover/card:opacity-100 transition-opacity
                    text-primary-500 dark:text-primary-400">
                    <FiArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
