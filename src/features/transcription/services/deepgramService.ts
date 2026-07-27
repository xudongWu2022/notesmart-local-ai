import { CONFIG, API_ROUTES } from '../../../shared/lib/config';

interface TranscriptionResult {
  transcription: string;
  confidence: number;
  duration?: number;
}

export const deepgramService = {
  async transcribeAudio(audioBlob: Blob, language: string = 'en'): Promise<TranscriptionResult> {
    try {
      const params = new URLSearchParams({
        model: 'nova-2',
        smart_format: 'true',
        language,
        punctuate: 'true',
        utterances: 'true',
      });

      const response = await fetch(`${API_ROUTES.DEEPGRAM_LISTEN}?${params}`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${CONFIG.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/mp3',
        },
        body: audioBlob,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transcription failed');
      }

      const result = await response.json();

      return {
        transcription: result.results?.channels[0]?.alternatives[0]?.transcript ?? '',
        confidence: result.results?.channels[0]?.alternatives[0]?.confidence ?? 0,
        duration: result.metadata?.duration,
      };
    } catch (error) {
      console.error('Deepgram transcription error:', error);
      throw error;
    }
  },
};
