/**
 * Vendor-agnostic contract every AI provider adapter must implement.
 * Business logic (AI admin assistant, notice writer, complaint triage, etc.)
 * is built against this interface only — never against a specific vendor SDK
 * — so the provider can be swapped via the AI_PROVIDER env var.
 *
 * Concrete AI features (structured tool-calling for DB-backed questions,
 * notice generation, complaint triage, etc.) are implemented on their
 * respective feature days, on top of this interface.
 */
export class AIProvider {
  /**
   * @param {object} params
   * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} params.messages
   * @param {object} [params.responseSchema] - optional Zod-describable JSON schema for structured output
   * @returns {Promise<{ text: string, raw: unknown }>}
   */
  // eslint-disable-next-line no-unused-vars
  async complete({ messages, responseSchema }) {
    throw new Error('AIProvider.complete() must be implemented by a concrete provider');
  }
}
