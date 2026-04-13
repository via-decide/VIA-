import type { StructuredContext } from './context_engine';

export interface CompiledPrompt {
  systemPrompt: string;
  userPrompt: string;
  transparency: string[];
  fullPrompt: string;
}

export function compilePrompt(context: StructuredContext): CompiledPrompt {
  const transparency = [
    `goals:${context.goals.length}`,
    `constraints:${context.constraints.length}`,
    `memory:${context.memoryContext.length}`,
    `research:${context.researchContext.length}`,
  ];

  const systemPrompt = [
    'You are VIA-DOS, a transparent decision operating system.',
    'Provide explicit reasoning steps, tradeoffs, and final recommendation.',
  ].join(' ');

  const userPrompt = [
    `Actor: ${context.actor}`,
    `Timestamp: ${context.createdAt}`,
    `Query: ${context.query}`,
    `Goals: ${context.goals.join('; ') || 'none'}`,
    `Constraints: ${context.constraints.join('; ') || 'none'}`,
    `Memory context: ${context.memoryContext.join(' | ') || 'none'}`,
    `Research context: ${context.researchContext.join(' | ') || 'none'}`,
  ].join('\n');

  return {
    systemPrompt,
    userPrompt,
    transparency,
    fullPrompt: `${systemPrompt}\n\n${userPrompt}`,
  };
}
