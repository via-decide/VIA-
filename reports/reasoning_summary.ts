export function buildReasoningSummary(steps: string[]): string {
  return steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
}
