import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDeepgramTranscription } from '../hooks/useDeepgramTranscription';
import { useTranslation } from '../hooks/useTranslation';
import { useTranscripts } from '../hooks/useTranscripts';
import { getTranscriptText } from '../utils';
import { useTranscriptStore } from '../hooks/useTranscripts';

export default function LiveTranscription({ onTranscriptionUpdate, isRecording }) {
  const transcriptionLanguage = useTranscriptStore(state => state.transcriptionLanguage);
  const transcriptBuffer = useTranscriptStore(state => state.transcriptBuffer);
  const updateTranscriptBuffer = useTranscriptStore(state => state.updateTranscriptBuffer);
  const isTranslating = useTranscriptStore(state => state.isTranslating);

  const { error, startRecording, stopRecording } = useDeepgramTranscription();
  const { _translateText } = useTranslation();
  const {
    updateLatestTranscript,
    _updateTranscriptTranslations,
  } = useTranscripts();

  const prevInterimRef = useRef('');
  const transcriptContainerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      startRecording(updateLatestTranscript, transcriptionLanguage);
    } else {
      stopRecording();
    }
  }, [isRecording, startRecording, stopRecording, updateLatestTranscript, transcriptionLanguage]);

  const { _historicalText, _incrementalText } = useMemo(() => {
    const { segments, currentSegment, interimResult } = transcriptBuffer;
    return getTranscriptText(
      [...segments, currentSegment],
      interimResult,
      prevInterimRef
    );
  }, [transcriptBuffer]);

  useEffect(() => {
    const { segments, currentSegment, interimResult } = transcriptBuffer;
    const allSegments = [...segments, currentSegment];
    const fullTranscript = allSegments.map(segment =>
      segment.texts.map(t => t.text).join(' ')
    ).join('\n');

    const currentContent = interimResult?.text
      ? `${fullTranscript}\n${interimResult.text}`
      : fullTranscript;

    onTranscriptionUpdate?.(currentContent, allSegments);
  }, [transcriptBuffer, onTranscriptionUpdate]);

  const displaySegments = useMemo(() => {
    const { segments, currentSegment, interimResult } = transcriptBuffer;

    const completedSegments = [...segments];

    if (currentSegment.texts.length > 0 || interimResult) {
      const currentDisplay = {
        ...currentSegment,
        texts: interimResult
          ? [...currentSegment.texts, interimResult]
          : currentSegment.texts
      };
      completedSegments.push(currentDisplay);
    }

    return completedSegments;
  }, [transcriptBuffer]);

  useEffect(() => {
    const container = transcriptContainerRef.current;
    if (container) {
      const { segments, currentSegment } = transcriptBuffer;
      const isNewSegment = segments.length > 0 && currentSegment.texts.length === 0;

      const shouldAutoScroll =
        isNewSegment ||
        isRecording ||
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      if (shouldAutoScroll) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [transcriptBuffer, isRecording]);

  useEffect(() => {
    updateTranscriptBuffer(transcriptBuffer);
  }, [transcriptBuffer, updateTranscriptBuffer]);

  return (
    <div className="h-full overflow-hidden bg-gradient-custom">
      <motion.div
        ref={transcriptContainerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full overflow-y-auto p-4
          scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
          scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb:hover]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-500"
      >
        {displaySegments.map((segment, index) => (
          <div
            key={segment.id || index}
            className={`p-4 rounded-lg border border-border-subtle mb-4 ${
              index === displaySegments.length - 1 && isRecording
                ? 'bg-blue-50/90 dark:bg-blue-900/20 backdrop-blur-sm'
                : 'bg-surface-card/80 backdrop-blur-sm'
            }`}
          >
            {/* Segment timestamp */}
            <div className="text-sm text-content-tertiary mb-2">
              {new Date(segment.startTime).toLocaleTimeString()}
            </div>

            {/* Segment content */}
            <div className="text-left text-content-primary">
              {segment.texts.map((text, i) => (
                <span key={text.id || i}>{text.text} </span>
              ))}
            </div>

            {/* Translation */}
            {isTranslating && segment.translation && (
              <div className="mt-2 text-content-secondary border-t border-border-subtle pt-2">
                {segment.translation}
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {error && (
        <div className="fixed bottom-4 left-4 bg-red-100/90 dark:bg-red-900/30 backdrop-blur-sm text-red-600
                      px-4 py-2 rounded-lg shadow">
          {error}
        </div>
      )}
    </div>
  );
}
