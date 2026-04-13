import { AccessControl } from './access_control';
import { validateInput, type InputValidationResult } from './input_validator';

export interface GuardrailRequest {
  subjectId: string;
  moduleId: string;
  input: unknown;
}

export interface GuardrailResult {
  allowed: boolean;
  validation: InputValidationResult;
  reasons: string[];
}

export class Guardrails {
  constructor(private accessControl: AccessControl) {}

  enforce(request: GuardrailRequest): GuardrailResult {
    const reasons: string[] = [];
    const validation = validateInput(request.input);

    if (!validation.valid) {
      reasons.push(...validation.errors);
    }

    if (!this.accessControl.canAccess(request.subjectId, request.moduleId)) {
      reasons.push(`subject ${request.subjectId} lacks permission for ${request.moduleId}`);
    }

    return {
      allowed: reasons.length === 0,
      validation,
      reasons,
    };
  }
}
