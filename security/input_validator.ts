export interface InputValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: string;
}

export function validateInput(input: unknown, maxLength = 4000): InputValidationResult {
  if (typeof input !== 'string') {
    return { valid: false, errors: ['input must be a string'] };
  }

  const sanitized = input.replace(/[<>]/g, '').trim();
  const errors: string[] = [];

  if (!sanitized.length) {
    errors.push('input cannot be empty');
  }
  if (sanitized.length > maxLength) {
    errors.push(`input exceeds max length of ${maxLength}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}
