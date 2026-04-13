export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateRequest(request: { moduleId?: string; action?: string }): ValidationResult {
  const errors: string[] = [];
  if (!request.moduleId) errors.push('moduleId is required');
  if (!request.action) errors.push('action is required');

  return {
    valid: errors.length === 0,
    errors,
  };
}
