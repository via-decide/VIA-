export class ContextIndex {
  private tags = new Map<string, Set<string>>();

  index(id: string, tags: string[]): void {
    for (const tag of tags) {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      this.tags.get(tag)?.add(id);
    }
  }

  find(tag: string): string[] {
    return [...(this.tags.get(tag) ?? new Set())];
  }

  remove(id: string): void {
    for (const values of this.tags.values()) {
      values.delete(id);
    }
  }
}
