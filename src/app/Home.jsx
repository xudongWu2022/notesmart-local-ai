import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FiMic,
  FiFileText,
  FiYoutube,
  FiHelpCircle,
  FiLayers,
  FiMap,
  FiUpload,
  FiCpu,
  FiBookOpen,
  FiArrowRight,
} from 'react-icons/fi';
import Navbar from '../shared/components/layout/Navbar';

const featuresMeta = [
  { icon: FiMic, titleKey: 'home.features.voiceToNotes', descKey: 'home.features.voiceToNotesDesc', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { icon: FiFileText, titleKey: 'home.features.documentImport', descKey: 'home.features.documentImportDesc', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
  { icon: FiYoutube, titleKey: 'home.features.youtubeNotes', descKey: 'home.features.youtubeNotesDesc', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
  { icon: FiHelpCircle, titleKey: 'home.features.quizGeneration', descKey: 'home.features.quizGenerationDesc', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  { icon: FiLayers, titleKey: 'home.features.flashcards', descKey: 'home.features.flashcardsDesc', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  { icon: FiMap, titleKey: 'home.features.mindMaps', descKey: 'home.features.mindMapsDesc', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/30' },
];

const stepsMeta = [
  { icon: FiUpload, titleKey: 'home.steps.uploadOrRecord', descKey: 'home.steps.uploadOrRecordDesc' },
  { icon: FiCpu, titleKey: 'home.steps.aiProcessing', descKey: 'home.steps.aiProcessingDesc' },
  { icon: FiBookOpen, titleKey: 'home.steps.studyAndReview', descKey: 'home.steps.studyAndReviewDesc' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

function Home() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-surface-bg">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <motion.div
              animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-20 left-[10%] w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-10 right-[15%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-28 sm:px-6 lg:px-8 lg:py-36">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.15 } },
              }}
              className="text-center space-y-8"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm">
                <FiBookOpen className="w-4 h-4" />
                {t('home.badge')}
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold text-white leading-tight">
                {t('home.heroTitle1')}
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-amber-300">
                  {t('home.heroTitle2')}
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
                {t('home.heroSubtitle')}
              </motion.p>

              <motion.div variants={fadeUp} className="flex items-center justify-center gap-8 pt-2 text-white/70 text-sm">
                <span className="flex items-center gap-1.5"><span className="text-white font-semibold text-lg">10K+</span> {t('home.statsStudents')}</span>
                <span className="w-px h-4 bg-white/30" />
                <span className="flex items-center gap-1.5"><span className="text-white font-semibold text-lg">1M+</span> {t('home.statsNotes')}</span>
                <span className="w-px h-4 bg-white/30" />
                <span className="flex items-center gap-1.5"><span className="text-white font-semibold text-lg">50+</span> {t('home.statsFeatures')}</span>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto pt-4">
                <Link
                  to="/login"
                  className="group px-8 py-4 bg-white text-blue-600 rounded-full font-semibold
                           hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl
                           flex items-center justify-center gap-2"
                >
                  {t('home.getStarted')}
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#features"
                  className="px-8 py-4 bg-white/10 text-white rounded-full font-medium
                           border border-white/25 hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  {t('home.learnMore')}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-content-primary">
                {t('home.featuresHeading')}
                <span className="text-primary-600"> {t('home.featuresHighlight')}</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-lg text-content-secondary max-w-2xl mx-auto">
                {t('home.featuresSubtitle')}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuresMeta.map((feature) => (
                <motion.div
                  key={feature.titleKey}
                  variants={fadeUp}
                  className="group p-6 bg-surface-card rounded-xl border border-border-subtle
                           shadow-sm hover:shadow-lg hover:-translate-y-1
                           transition-all duration-300"
                >
                  <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4
                                group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-content-primary mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-content-secondary leading-relaxed">{t(feature.descKey)}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-surface-elevated">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-content-primary">
                {t('home.howItWorks')} <span className="text-primary-600">{t('home.howItWorksHighlight')}</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-lg text-content-secondary max-w-2xl mx-auto">
                {t('home.howItWorksSubtitle')}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
            >
              <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200 dark:from-primary-800 dark:via-primary-700 dark:to-primary-800" />

              {stepsMeta.map((step, index) => (
                <motion.div key={step.titleKey} variants={fadeUp} custom={index} className="relative text-center">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl
                               bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6
                               shadow-lg shadow-blue-500/25">
                    <step.icon className="w-7 h-7" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-surface-card rounded-full
                                   flex items-center justify-center text-sm font-bold text-primary-600
                                   shadow-md border border-primary-100 dark:border-primary-800">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-content-primary mb-3">{t(step.titleKey)}</h3>
                  <p className="text-content-secondary leading-relaxed max-w-xs mx-auto">{t(step.descKey)}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              className="text-center bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl
                       p-12 md:p-16 shadow-xl shadow-blue-500/20"
            >
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('home.ctaTitle')}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                {t('home.ctaSubtitle')}
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600
                           rounded-full font-semibold hover:bg-blue-50 transition-all
                           shadow-lg hover:shadow-xl"
                >
                  {t('home.getStarted')}
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-content-secondary">
                <FiBookOpen className="w-5 h-5 text-primary-500" />
                <span className="font-semibold">NoteSmart</span>
              </div>
              <p className="text-sm text-content-tertiary">
                &copy; {new Date().getFullYear()} {t('home.copyright')}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Home;
