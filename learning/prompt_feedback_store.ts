export interface PromptFeedbackRecord {
  id: string;
  decisionId: string;
  userInput: string;
  compiledPrompt: string;
  responseStructure: Record<string, unknown>;
  finalDecisionResult: string;
  qualityScore: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export class PromptFeedbackStore {
  private enabled = true;
  private records: PromptFeedbackRecord[] = [];

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  addRecord(input: Omit<PromptFeedbackRecord, 'createdAt'>): PromptFeedbackRecord | null {
    if (!this.enabled) {
      return null;
    }

    const record: PromptFeedbackRecord = {
      ...input,
      createdAt: new Date().toISOString(),
    };

    this.records.push(record);
    return record;
  }

  listByDecision(decisionId: string): PromptFeedbackRecord[] {
    return this.records.filter((entry) => entry.decisionId === decisionId);
  }

  appendMetadata(id: string, metadata: Record<string, unknown>): PromptFeedbackRecord | null {
    const record = this.records.find((entry) => entry.id === id);
    if (!record) {
      return null;
    }

    record.metadata = { ...(record.metadata ?? {}), ...metadata };
    return record;
  }
}
