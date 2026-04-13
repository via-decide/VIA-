import { buildStructuredContext, type ReasoningIntent } from './context_engine';
import { compilePrompt } from './prompt_compiler';
import { formatResponse, type RawModelResponse } from './response_formatter';

export interface ReasoningPipelineResult {
  context: ReturnType<typeof buildStructuredContext>;
  prompt: ReturnType<typeof compilePrompt>;
  response: ReturnType<typeof formatResponse>;
}

export async function runReasoningPipeline(
  intent: ReasoningIntent,
  modelExecutor: (prompt: string) => Promise<RawModelResponse>
): Promise<ReasoningPipelineResult> {
  const context = buildStructuredContext(intent);
  const prompt = compilePrompt(context);
  const raw = await modelExecutor(prompt.fullPrompt);

  return {
    context,
    prompt,
    response: formatResponse(raw),
  };
}
