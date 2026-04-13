export interface SessionRecord {
  id: string;
  startedAt: string;
  metadata: Record<string, unknown>;
}

export class SessionManager {
  private activeSessions = new Map<string, SessionRecord>();

  startSession(id: string, metadata: Record<string, unknown> = {}): SessionRecord {
    const session: SessionRecord = {
      id,
      startedAt: new Date().toISOString(),
      metadata,
    };
    this.activeSessions.set(id, session);
    return session;
  }

  endSession(id: string): SessionRecord | undefined {
    const session = this.activeSessions.get(id);
    this.activeSessions.delete(id);
    return session;
  }

  getSession(id: string): SessionRecord | undefined {
    return this.activeSessions.get(id);
  }

  listSessions(): SessionRecord[] {
    return [...this.activeSessions.values()];
  }
}
