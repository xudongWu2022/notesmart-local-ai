import { getAiSettings } from './aiSettings';
import { CONFIG } from './config';

export interface AiRequest {
  instruction: string;
  input: string;
  maxTokens?: number;
  temperature?: number;
}

function errorMessage(response: Response, provider: string): Promise<never> {
  return response.text().then((body) => {
    const details = body ? ` ${body.slice(0, 240)}` : '';
    throw new Error(`${provider} request failed (${response.status}).${details}`);
  });
}

export async function generateAiText(request: AiRequest): Promise<string> {
  const settings = getAiSettings();
  if (!settings.apiKey.trim()) {
    throw new Error('No AI API key is configured. Open Settings → AI provider to add your own key.');
  }

  if (settings.provider === 'openai') {
    let response: Response;
    try {
      response = await fetch(`${CONFIG.LOCAL_BACKEND_URL}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'openai',
          apiKey: settings.apiKey,
          model: settings.model,
          baseUrl: settings.baseUrl,
          instruction: request.instruction,
          input: request.input,
          maxTokens: request.maxTokens ?? 1800,
        }),
      });
    } catch {
      throw new Error(`Could not reach the local AI service at ${CONFIG.LOCAL_BACKEND_URL}. Start it with: python backend/app.py`);
    }
    if (!response.ok) return errorMessage(response, settings.baseUrl ? 'OpenAI-compatible provider' : 'OpenAI');
    const data = await response.json();
    const text = data.text as string | undefined;
    if (!text) throw new Error('OpenAI returned no text output.');
    return text;
  }

  if (settings.provider === 'gemini') {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`,
      {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: request.instruction }] },
        contents: [{ role: 'user', parts: [{ text: request.input }] }],
        generationConfig: { temperature: request.temperature ?? 0.5, maxOutputTokens: request.maxTokens ?? 1800 },
      }),
      },
    );
    if (!response.ok) return errorMessage(response, 'Gemini');
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
    if (!text) throw new Error('Gemini returned no text output.');
    return text;
  }

  const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey}` },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: 'system', content: request.instruction },
        { role: 'user', content: request.input },
      ],
      temperature: request.temperature ?? 0.5,
      max_tokens: request.maxTokens ?? 1800,
    }),
  });
  if (!response.ok) return errorMessage(response, 'SiliconFlow');
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content as string | undefined;
  if (!text) throw new Error('SiliconFlow returned no text output.');
  return text;
}

export async function testAiConnection(settingsOverride?: { provider: string; apiKey: string; model: string; baseUrl: string }): Promise<void> {
  const previous = getAiSettings();
  if (settingsOverride) localStorage.setItem('notesmart-ai-settings', JSON.stringify(settingsOverride));
  try {
    const reply = await generateAiText({ instruction: 'Reply with exactly: OK', input: 'Connection test', maxTokens: 16 });
    if (!reply.trim()) throw new Error('The provider returned an empty response.');
  } finally {
    if (settingsOverride) localStorage.setItem('notesmart-ai-settings', JSON.stringify(previous));
  }
}

export function parseJsonArray<T>(raw: string): T[] {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = trimmed.indexOf('[');
  const end = trimmed.lastIndexOf(']');
  if (start < 0 || end < start) throw new Error('The AI response was not a JSON array. Please try again.');
  return JSON.parse(trimmed.slice(start, end + 1)) as T[];
}
