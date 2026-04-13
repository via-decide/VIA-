export interface UserIntent {
  userId?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export function buildContext(intent: UserIntent) {
  return {
    userId: intent.userId ?? 'anonymous',
    message: intent.message.trim(),
    metadata: intent.metadata ?? {},
    createdAt: new Date().toISOString(),
  };
}
