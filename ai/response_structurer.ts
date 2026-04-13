export interface RawAiResponse {
  output: string;
  confidence?: number;
  tokensUsed?: number;
}

export function structureResponse(response: RawAiResponse) {
  return {
    summary: response.output.trim(),
    confidence: response.confidence ?? 0,
    tokensUsed: response.tokensUsed ?? 0,
    normalizedAt: new Date().toISOString(),
  };
}
