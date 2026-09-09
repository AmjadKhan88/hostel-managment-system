import { env } from '../config/env.js';
import { GeminiProvider } from './providers/GeminiProvider.js';

let instance;

/**
 * Returns the active AI provider based on AI_PROVIDER env config.
 * Business/service code should always import getAIProvider(), never a
 * concrete provider class, so vendors can be added or swapped without
 * touching feature code.
 */
export function getAIProvider() {
  if (instance) return instance;

  switch (env.AI_PROVIDER) {
    case 'gemini':
      instance = new GeminiProvider();
      break;
    default:
      instance = null;
  }

  return instance;
}
