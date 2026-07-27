export type AiProvider = 'openai' | 'gemini' | 'siliconflow';

export interface AiSettings {
  provider: AiProvider;
  apiKey: string;
  model: string;
  /** Optional OpenAI-compatible API root, e.g. http://127.0.0.1:8080. */
  baseUrl: string;
}

const STORAGE_KEY = 'notesmart-ai-settings';

const defaults: Record<AiProvider, string> = {
  openai: 'gpt-5.6-luna',
  gemini: 'gemini-2.0-flash',
  siliconflow: 'Qwen/Qwen2.5-7B-Instruct',
};

export function getAiSettings(): AiSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AiSettings>;
      const provider = parsed.provider && defaults[parsed.provider] ? parsed.provider : 'openai';
      return {
        provider,
        apiKey: parsed.apiKey ?? '',
        model: parsed.model || defaults[provider],
        baseUrl: parsed.baseUrl ?? '',
      };
    }
  } catch {
    // A malformed local setting must never prevent the app from starting.
  }
  return { provider: 'openai', apiKey: '', model: defaults.openai, baseUrl: '' };
}

export function saveAiSettings(settings: AiSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function defaultModelFor(provider: AiProvider): string {
  return defaults[provider];
}

export function hasAiConfiguration(): boolean {
  return Boolean(getAiSettings().apiKey.trim());
}
