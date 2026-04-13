import { buildContext, type UserIntent } from './context_builder';
import { transformPrompt } from './prompt_transformer';
import { structureResponse, type RawAiResponse } from './response_structurer';

export interface ReasoningResult {
  context: ReturnType<typeof buildContext>;
  prompt: string;
  response: ReturnType<typeof structureResponse>;
}

export function runReasoningPipeline(
  intent: UserIntent,
  modelExecutor: (prompt: string) => Promise<RawAiResponse>
): Promise<ReasoningResult> {
  const context = buildContext(intent);
  const prompt = transformPrompt(context);

  return modelExecutor(prompt).then((rawResponse) => ({
    context,
    prompt,
    response: structureResponse(rawResponse),
  }));
}
