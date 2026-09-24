import { AIProvider } from '../AIProvider.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = env.GEMINI_API_KEY;
    this.model = env.GEMINI_MODEL;
  }

  async complete({ messages, tools, systemInstruction }) {
    if (!this.apiKey) {
      throw ApiError.internal('AI provider is not configured (missing GEMINI_API_KEY)');
    }

    const body = { contents: messages };
    if (tools) body.tools = [{ function_declarations: tools }];
    if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };

    const response = await fetch(
      `${GEMINI_API_BASE}/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw ApiError.internal(`AI provider request failed: ${errText}`);
    }

    const data = await response.json();
    const part = data.candidates?.[0]?.content?.parts?.[0];

    return {
      text: part?.text ?? null,
      functionCall: part?.functionCall ?? null,
      raw: data,
    };
  }
}
