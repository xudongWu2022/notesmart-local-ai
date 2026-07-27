/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DEEPGRAM_API_KEY: string;
  readonly VITE_SILICONFLOW_API_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_TRANSCRIPT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
