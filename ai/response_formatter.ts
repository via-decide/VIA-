export interface RawModelResponse {
  text: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface FormattedResponse {
  summary: string;
  reasoningSteps: string[];
  recommendation: string;
  confidence: number;
  metadata: Record<string, unknown>;
}

export function formatResponse(response: RawModelResponse): FormattedResponse {
  const lines = response.text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    summary: lines[0] ?? '',
    reasoningSteps: lines.slice(1),
    recommendation: lines.at(-1) ?? '',
    confidence: response.confidence ?? 0,
    metadata: response.metadata ?? {},
  };
}
