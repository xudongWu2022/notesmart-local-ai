import React from 'react';
import { useNavigate } from 'react-router-dom';
// 添加图标导入
import { MicrophoneIcon, StopIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { languages } from '../../../shared/lib/languages';
import { useTranscriptStore } from '../hooks/useTranscripts';

const TranscriptionPanel = ({
  isRecording,
  _isTranslating,
  _transcriptionLanguage,
  _translationLanguage,
  _onTranscriptionLanguageChange,
  _onTranslationLanguageChange,
  onRecordingToggle,
  onTranslationToggle,
  onGenerateNote,
  hasTranscripts,
}) => {
  const navigate = useNavigate();
  // 从 store 获取状态和更新方法
  const {
    transcriptionLanguage: storeTranscriptionLanguage,
    translationLanguage: storeTranslationLanguage,
    isTranslating: storeIsTranslating,
    setTranscriptionLanguage,
    setTranslationLanguage,
    _setIsTranslating
  } = useTranscriptStore();

  const noteLanguage =useTranscriptStore(state=>state.noteLanguage);
  const setNoteLanguage =useTranscriptStore(state=>state.setNoteLanguage);

  // 修改生成笔记按钮的处理函数
  const handleGenerateNote = async () => {
    try {
      const noteId = await onGenerateNote(); // 假设 onGenerateNote 返回生成的笔记 ID
      if (noteId) {
        navigate(`/notes/${noteId}`); // 生成成功后跳转到笔记详情页
      }
    } catch (error) {
      console.error('Failed to generate note:', error);
      // 可以添加错误提示
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-bg">
      <div className="p-4 space-y-4">
        {/* 录音控制按钮 */}
        <button
          onClick={onRecordingToggle}
          className={`w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl
                     transition-all duration-300 transform hover:-translate-y-0.5 relative group
                     ${isRecording
            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-[0_8px_16px_-4px_rgba(239,68,68,0.3)]'
            : 'bg-gradient-to-br from-white/95 to-white/85 hover:from-white hover:to-white/90 border border-white/60 hover:border-blue-200/80 hover:shadow-[0_8px_16px_-4px_rgba(59,130,246,0.15)]'
          }`}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {isRecording ? (
            <>
              <StopIcon className="w-5 h-5 drop-shadow-sm" />
              <span className="font-medium tracking-wide drop-shadow-sm">Stop Recording</span>
            </>
          ) : (
            <>
              <MicrophoneIcon className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors duration-300" />
              <span className="font-medium tracking-wide text-gray-700 group-hover:text-blue-600 transition-colors duration-300">Start Recording</span>
            </>
          )}
        </button>

        {/* 语言控制部分 */}
        <div className="space-y-3.5">
          {/* 转录语言选择 */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block font-medium pl-1">
              Transcription Language
            </label>
            <div className="relative group">
              <select
                value={storeTranscriptionLanguage}
                onChange={(e) => setTranscriptionLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm appearance-none
                         bg-white/80 hover:bg-white/90 focus:bg-white
                         border border-white/60 hover:border-blue-200/80
                         focus:border-blue-300/80 focus:ring-2 focus:ring-blue-300/30
                         shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
                         hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)]
                         focus:shadow-[0_4px_16px_-8px_rgba(59,130,246,0.3)]
                         transition-all duration-300 text-gray-700"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none
                            text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Note Language */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block font-medium pl-1">
              Note Language
            </label>
            <div className="relative group">
              <select
                value={noteLanguage}
                onChange={(e) => setNoteLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm appearance-none
                         bg-white/80 hover:bg-white/90 focus:bg-white
                         border border-white/60 hover:border-blue-200/80
                         focus:border-blue-300/80 focus:ring-2 focus:ring-blue-300/30
                         shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
                         hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)]
                         focus:shadow-[0_4px_16px_-8px_rgba(59,130,246,0.3)]
                         transition-all duration-300 text-gray-700"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none
                            text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Translation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600 font-medium pl-1">
                Translation
              </label>
              <button
                onClick={onTranslationToggle}
                className={`relative px-4 py-1.5 rounded-xl text-sm font-medium
                         transition-all duration-300 transform hover:-translate-y-0.5 group
                         ${storeIsTranslating
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-[0_8px_16px_-4px_rgba(59,130,246,0.3)]'
                  : 'bg-gradient-to-br from-white/95 to-white/85 hover:from-white hover:to-white/90 border border-white/60 hover:border-blue-200/80 hover:shadow-[0_8px_16px_-4px_rgba(59,130,246,0.15)]'
                }`}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">{storeIsTranslating ? 'On' : 'Off'}</span>
              </button>
            </div>

            {storeIsTranslating && (
              <div className="relative group">
                <select
                  value={storeTranslationLanguage}
                  onChange={(e) => setTranslationLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm appearance-none
                           bg-white/80 hover:bg-white/90 focus:bg-white
                           border border-white/60 hover:border-blue-200/80
                           focus:border-blue-300/80 focus:ring-2 focus:ring-blue-300/30
                           shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
                           hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)]
                           focus:shadow-[0_4px_16px_-8px_rgba(59,130,246,0.3)]
                           transition-all duration-300 text-gray-700"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none
                              text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate Note Button */}
        <div className="pt-3 border-t border-white/30">
          <button
            onClick={handleGenerateNote}
            disabled={!hasTranscripts}
            className={`w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl
                       font-medium transition-all duration-300 transform hover:-translate-y-0.5 relative group
                       ${hasTranscripts
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-[0_8px_16px_-4px_rgba(16,185,129,0.3)]'
              : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <DocumentTextIcon className="w-5 h-5" />
            <span className="tracking-wide">Generate Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionPanel;
