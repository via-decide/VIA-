export interface ReasoningIntent {
  userId?: string;
  query: string;
  goals?: string[];
  constraints?: string[];
  memoryContext?: string[];
  researchContext?: string[];
}

export interface StructuredContext {
  actor: string;
  query: string;
  goals: string[];
  constraints: string[];
  memoryContext: string[];
  researchContext: string[];
  createdAt: string;
}

export function buildStructuredContext(intent: ReasoningIntent): StructuredContext {
  return {
    actor: intent.userId ?? 'anonymous',
    query: intent.query.trim(),
    goals: intent.goals ?? [],
    constraints: intent.constraints ?? [],
    memoryContext: intent.memoryContext ?? [],
    researchContext: intent.researchContext ?? [],
    createdAt: new Date().toISOString(),
  };
}
