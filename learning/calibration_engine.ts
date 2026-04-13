import type { DiscoveredPattern } from './pattern_miner';

export interface CalibrationSnapshot {
  patternKey: string;
  calibratedConfidence: number;
  recommendationWeight: number;
  reliabilityScore: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export class CalibrationEngine {
  private enabled = true;
  private reliability = new Map<string, number>();
  private snapshots: CalibrationSnapshot[] = [];

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  calibrate(patterns: DiscoveredPattern[]): CalibrationSnapshot[] {
    if (!this.enabled) {
      return [];
    }

    const updates: CalibrationSnapshot[] = patterns.map((pattern) => {
      const previous = this.reliability.get(pattern.key) ?? 0.5;
      const reliabilityScore = previous * 0.7 + pattern.successRate * 0.3;
      this.reliability.set(pattern.key, reliabilityScore);

      const calibratedConfidence = pattern.successRate >= 0.5
        ? Math.min(1, 0.5 + reliabilityScore / 2)
        : Math.max(0.05, reliabilityScore / 2);

      const recommendationWeight = calibratedConfidence * (pattern.frequency > 2 ? 1.1 : 0.9);

      const snapshot: CalibrationSnapshot = {
        patternKey: pattern.key,
        calibratedConfidence,
        recommendationWeight,
        reliabilityScore,
        createdAt: new Date().toISOString(),
      };

      this.snapshots.push(snapshot);
      return snapshot;
    });

    return updates;
  }

  getReliabilityScore(patternKey: string): number {
    return this.reliability.get(patternKey) ?? 0.5;
  }

  listSnapshots(): CalibrationSnapshot[] {
    return [...this.snapshots];
  }
}
