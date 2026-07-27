import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { RiVipCrownFill } from 'react-icons/ri';
import { FiMic, FiRadio, FiPlay, FiUpload } from 'react-icons/fi';

const INPUT_OPTIONS = [
  {
    id: 'audio',
    icon: FiMic,
    titleKey: 'dashboard.inputOptions.recordAudio',
    subtitleKey: 'dashboard.inputOptions.recordAudioSub',
    bgColor: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
    glowColor: 'group-hover:shadow-blue-500/50',
    borderColor: 'border-blue-400/20',
  },
  {
    id: 'lecture',
    icon: FiRadio,
    titleKey: 'dashboard.inputOptions.liveLecture',
    subtitleKey: 'dashboard.inputOptions.liveLectureSub',
    bgColor: 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600',
    glowColor: 'group-hover:shadow-purple-500/50',
    borderColor: 'border-purple-400/20',
    isPro: true,
  },
  {
    id: 'youtube',
    icon: FiPlay,
    titleKey: 'dashboard.inputOptions.youtube',
    subtitleKey: 'dashboard.inputOptions.youtubeSub',
    bgColor: 'bg-gradient-to-br from-red-400 via-red-500 to-red-600',
    glowColor: 'group-hover:shadow-red-500/50',
    borderColor: 'border-red-400/20',
  },
  {
    id: 'document',
    icon: FiUpload,
    titleKey: 'dashboard.inputOptions.document',
    subtitleKey: 'dashboard.inputOptions.documentSub',
    bgColor: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600',
    glowColor: 'group-hover:shadow-emerald-500/50',
    borderColor: 'border-emerald-400/20',
  },
];

export default function InputOptionsGrid({ onSelect }) {
  const { t } = useTranslation();

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-content-primary mb-4">
        {t('dashboard.quickActions')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {INPUT_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.id}
              whileHover={option.isComingSoon ? {} : { scale: 1.02, y: -3 }}
              whileTap={option.isComingSoon ? {} : { scale: 0.98 }}
              onClick={() => !option.isComingSoon && onSelect(option.id)}
              aria-label={t(option.titleKey)}
              className={`relative p-5 rounded-xl border ${option.borderColor} ${option.bgColor}
                text-white text-left group
                ${option.isComingSoon ? 'opacity-60 cursor-not-allowed' : `hover:shadow-lg ${option.glowColor}`}
                backdrop-blur-lg h-[130px]
                transform-gpu will-change-transform`}
            >
              {option.isComingSoon && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500
                    text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-lg z-10"
                >
                  {t('common.comingSoon')}
                </motion.span>
              )}
              {option.isNew && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500
                    text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-lg"
                >
                  New
                </motion.span>
              )}
              {option.isPro && (
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className="absolute top-3 right-3"
                >
                  <RiVipCrownFill className="text-yellow-300 text-sm" />
                </motion.div>
              )}
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mb-3
                group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{t(option.titleKey)}</h3>
              <p className="text-xs text-white/80 line-clamp-2">{t(option.subtitleKey)}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
