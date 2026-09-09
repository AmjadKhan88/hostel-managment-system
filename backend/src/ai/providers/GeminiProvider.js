import { AIProvider } from '../AIProvider.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Gemini implementation of AIProvider.
 * The actual API call is wired up on the day AI features are implemented —
 * this Day 1 stub only establishes the seam so business code never depends
 * on the Gemini SDK directly.
 */
export class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = env.GEMINI_API_KEY;
  }

  // eslint-disable-next-line no-unused-vars
  async complete({ messages }) {
    if (!this.apiKey) {
      throw ApiError.internal('AI provider is not configured (missing GEMINI_API_KEY)');
    }
    // Implemented when the first AI feature is built.
    throw ApiError.internal('GeminiProvider.complete() not yet implemented');
  }
}
