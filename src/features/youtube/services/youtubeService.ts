import { db } from '../../../db/db';
import { CONFIG } from '../../../shared/lib/config';
import { generateNote } from '../../notes/services/noteGenerationService';

interface TranscriptItem {
  text: string;
  start?: number;
  duration?: number;
}

interface TranscriptData {
  transcript: TranscriptItem[];
  language?: string;
  language_code?: string;
}

interface YouTubeResult {
  noteId: number;
  content: string;
  metadata: {
    youtubeUrl: string;
    videoId: string;
    transcript: string;
    language?: string;
    language_code?: string;
    date: string;
  };
}

export const youtubeService = {
  async processYouTubeVideo(youtubeUrl: string, title?: string): Promise<YouTubeResult> {
    try {
      const videoId = this.extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const transcriptResponse = await fetch(`${CONFIG.TRANSCRIPT_API_URL}?videoId=${videoId}`);

      if (!transcriptResponse.ok) {
        const errorData = await transcriptResponse.json();
        throw new Error(errorData.error || 'Failed to fetch transcript');
      }

      const transcriptData: TranscriptData = await transcriptResponse.json();

      const transcript = transcriptData.transcript.map((item) => item.text).join('\n');
      const content = await generateNote(transcript, transcriptData.language_code || 'en');

      const noteData = {
        title: title || 'YouTube Note',
        content,
        transcript,
        youtubeUrl,
        date: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        syncStatus: 'pending' as const,
      };

      const noteId = await db.notes.add(noteData as never);

      const metadata = {
        youtubeUrl,
        videoId,
        transcript,
        language: transcriptData.language,
        language_code: transcriptData.language_code,
        date: new Date().toISOString(),
      };

      return {
        noteId,
        content,
        metadata,
      };
    } catch (error) {
      console.error('YouTube Video Processing Failed:', error);
      throw error;
    }
  },

  extractVideoId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
      return null;
    } catch {
      return null;
    }
  },
};
