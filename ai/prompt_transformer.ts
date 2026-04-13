export function transformPrompt(context: {
  userId: string;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}) {
  return [
    'You are VIA, a decision support engine.',
    `User: ${context.userId}`,
    `Timestamp: ${context.createdAt}`,
    `Intent: ${context.message}`,
    `Metadata: ${JSON.stringify(context.metadata)}`,
  ].join('\n');
}
