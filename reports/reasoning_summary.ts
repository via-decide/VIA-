export function buildReasoningSummary(steps: string[]): string {
  if (!steps.length) {
    return 'No reasoning steps were provided.';
  }
  return steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
}
