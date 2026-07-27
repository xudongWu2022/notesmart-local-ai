import { CONFIG, API_ROUTES } from '../../../shared/lib/config';

interface TranscriptionResult {
  transcription: string;
  suggestedTitle: string;
  confidence: number;
  duration?: number;
}

interface TitleResponse {
  title: string;
}

export const transcribeAudio = async (formData: FormData): Promise<TranscriptionResult> => {
  try {
    const audioFile = formData.get('audio') as File;
    const audioLanguage = formData.get('audioLanguage') as string;
    const userTitle = formData.get('title') as string | null;

    if (audioFile.size > 2 * 1024 * 1024 * 1024) {
      throw new Error('File size exceeds 2GB limit');
    }

    const params = new URLSearchParams({
      model: 'nova-2',
      smart_format: 'true',
      language: audioLanguage,
      punctuate: 'true',
      utterances: 'true',
    });

    const response = await fetch(`${API_ROUTES.DEEPGRAM_LISTEN}?${params}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${CONFIG.DEEPGRAM_API_KEY}`,
      },
      body: audioFile,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Transcription API error:', errorData);

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 504) {
        throw new Error('Transcription timeout. File may be too long.');
      }

      throw new Error(`API error: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();

    const transcription: string =
      data.results?.channels[0]?.alternatives[0]?.transcript ?? '';
    const confidence: number =
      data.results?.channels[0]?.alternatives[0]?.confidence ?? 0;

    let suggestedTitle = userTitle ?? '';
    if (!userTitle) {
      try {
        const titleResponse = await generateTitleFromTranscription(transcription);
        suggestedTitle = titleResponse.title;
      } catch {
        suggestedTitle = new Date().toLocaleDateString();
      }
    }

    return {
      transcription,
      suggestedTitle,
      confidence,
      duration: data.metadata?.duration,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio: ' + message);
  }
};

async function generateTitleFromTranscription(transcription: string): Promise<TitleResponse> {
  try {
    const response = await fetch('/api/generate-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcription: transcription.substring(0, 500),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate title');
    }

    const data: TitleResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating title:', error);
    throw error;
  }
}
