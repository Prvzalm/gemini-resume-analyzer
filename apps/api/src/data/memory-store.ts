import type { MatchResult } from "../types.js";

class MemoryStore {
  private matches: MatchResult[] = [];

  insert(match: MatchResult) {
    this.matches.unshift(match);
    this.matches = this.matches.slice(0, 50);
  }

  getRecent(limit = 5) {
    return this.matches.slice(0, limit);
  }
}

export const memoryStore = new MemoryStore();
