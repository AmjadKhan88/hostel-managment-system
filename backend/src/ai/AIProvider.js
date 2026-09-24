/**
 * Vendor-agnostic contract every AI provider adapter must implement.
 * Business logic (AI admin assistant, notice writer, complaint triage, etc.)
 * is built against this interface only — never against a specific vendor SDK
 * — so the provider can be swapped via the AI_PROVIDER env var.
 */
export class AIProvider {
  /**
   * @param {object} params
   * @param {Array<{role: 'user'|'model', parts: Array<object>}>} params.messages
   * @param {Array<object>} [params.tools] - function declarations the model may call
   * @param {string} [params.systemInstruction] - system-level guidance
   * @returns {Promise<{ text: string|null, functionCall: {name: string, args: object}|null, raw: unknown }>}
   */
  // eslint-disable-next-line no-unused-vars
  async complete({ messages, tools, systemInstruction }) {
    throw new Error('AIProvider.complete() must be implemented by a concrete provider');
  }
}
