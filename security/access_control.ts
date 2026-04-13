export class AccessControl {
  private permissions = new Map<string, Set<string>>();

  grant(subjectId: string, moduleId: string): void {
    if (!this.permissions.has(subjectId)) {
      this.permissions.set(subjectId, new Set());
    }
    this.permissions.get(subjectId)?.add(moduleId);
  }

  revoke(subjectId: string, moduleId: string): void {
    this.permissions.get(subjectId)?.delete(moduleId);
  }

  canAccess(subjectId: string, moduleId: string): boolean {
    return this.permissions.get(subjectId)?.has(moduleId) ?? false;
  }
}
