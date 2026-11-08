// P25.5-E17: rolling update — כמה pods מותר, ואיך ה־rollout מתקדם
export type Amount = number | `${number}%`;

export function rolloutBounds(replicas: number, maxSurge: Amount, maxUnavailable: Amount): { maxPods: number; minAvailable: number } {
  throw new Error("עוד לא כתבת את הפתרון");
}

export interface Snapshot {
  old: number;
  new: number;
}

export function simulateRollout(replicas: number, maxSurge: Amount, maxUnavailable: Amount): { maxPods: number; minAvailable: number; steps: Snapshot[] } {
  throw new Error("עוד לא כתבת את הפתרון");
}
