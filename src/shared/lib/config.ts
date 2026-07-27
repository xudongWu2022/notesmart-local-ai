// Centralized configuration - all env vars read here, never in components/services directly

export const CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  DEEPGRAM_API_KEY: import.meta.env.VITE_DEEPGRAM_API_KEY || '',
  SILICONFLOW_API_KEY: import.meta.env.VITE_SILICONFLOW_API_KEY || '',
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  TRANSCRIPT_API_URL: import.meta.env.VITE_TRANSCRIPT_API_URL || 'http://localhost:5001/transcript',
  LOCAL_BACKEND_URL: import.meta.env.VITE_LOCAL_BACKEND_URL || 'http://localhost:5001',
  SYNC_ENABLED: Boolean(import.meta.env.VITE_API_URL),
} as const;

export const API_ROUTES = {
  // Notes
  NOTES: `${CONFIG.API_URL}/notes`,
  NOTE: (id: number) => `${CONFIG.API_URL}/notes/${id}`,
  NOTE_FLASHCARDS: (noteId: number) => `${CONFIG.API_URL}/notes/${noteId}/flashcards`,

  // Folders
  FOLDER: (id: number) => `${CONFIG.API_URL}/folders/${id}`,
  FOLDER_MOVE: (id: number) => `${CONFIG.API_URL}/folders/${id}/move`,

  // Videos
  VIDEOS: `${CONFIG.API_URL}/videos`,
  VIDEO: (id: string) => `${CONFIG.API_URL}/videos/${id}`,
  VIDEO_UPLOAD: `${CONFIG.API_URL}/videos/upload`,

  // External APIs
  SILICONFLOW_CHAT: 'https://api.siliconflow.cn/chat/completions',
  GEMINI_GENERATE: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
  GEMINI_STREAM: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent`,
  DEEPGRAM_LISTEN: 'https://api.deepgram.com/v1/listen',
} as const;
