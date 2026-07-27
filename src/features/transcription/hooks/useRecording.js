import { useRef, useEffect, useCallback } from 'react';

export const useRecording = ({
  isTranslating,
  updateLatestTranscript,
  updateTranscriptTranslations,
  translateText,
}) => {
  const transcriptHandlerRef = useRef(null);

  useEffect(() => {
    transcriptHandlerRef.current = (data) => {
      updateLatestTranscript(data);

      if (isTranslating) {
        const transcript =
          data?.channel?.alternatives?.[0]?.processedTranscript;
        if (transcript?.text) {
          translateText(transcript.text).then((translation) => {
            if (translation) {
              updateTranscriptTranslations(transcript.id, translation);
            }
          });
        }
      }
    };
  }, [
    isTranslating,
    updateLatestTranscript,
    translateText,
    updateTranscriptTranslations,
  ]);

  const handleTranscriptWithLatestState = useCallback(
    (data) => {
      if (transcriptHandlerRef.current) {
        transcriptHandlerRef.current(data);
      }
    },
    [transcriptHandlerRef],
  );

  return handleTranscriptWithLatestState;
};
