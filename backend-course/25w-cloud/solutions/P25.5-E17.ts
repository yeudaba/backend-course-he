// P25.5-E17: rolling update — כמה pods מותר, ואיך ה־rollout מתקדם
export type Amount = number | `${number}%`;

function resolve(amount: Amount, replicas: number, round: (n: number) => number, name: string): number {
  if (typeof amount === "number") {
    if (!Number.isInteger(amount) || amount < 0) throw new Error(`${name} לא תקין: ${amount}`);
    return amount;
  }
  const m = /^(\d+)%$/.exec(amount);
  if (!m) throw new Error(`${name} לא תקין: ${amount}`);
  return round((replicas * Number(m[1])) / 100);
}

export function rolloutBounds(replicas: number, maxSurge: Amount, maxUnavailable: Amount) {
  if (!Number.isInteger(replicas) || replicas < 1) throw new Error("replicas חייב להיות לפחות 1");
  const surge = resolve(maxSurge, replicas, Math.ceil, "maxSurge"); // Kubernetes: surge מעגל למעלה
  const unavailable = resolve(maxUnavailable, replicas, Math.floor, "maxUnavailable"); // unavailable — למטה
  if (surge === 0 && unavailable === 0) throw new Error("maxSurge ו־maxUnavailable לא יכולים להיות שניהם 0 — ה־rollout לא יתקדם");
  return { maxPods: replicas + surge, minAvailable: replicas - unavailable };
}

export interface Snapshot {
  old: number;
  new: number;
}

// מודל פשוט: pods חדשים שנוצרו בצעד מוכנים (ready) בסוף הצעד
export function simulateRollout(replicas: number, maxSurge: Amount, maxUnavailable: Amount) {
  const { maxPods, minAvailable } = rolloutBounds(replicas, maxSurge, maxUnavailable);
  let oldPods = replicas;
  let newPods = 0;
  const steps: Snapshot[] = [{ old: oldPods, new: newPods }];
  while (oldPods > 0 || newPods < replicas) {
    const remove = Math.max(0, Math.min(oldPods, oldPods + newPods - minAvailable));
    oldPods -= remove;
    const add = Math.max(0, Math.min(replicas - newPods, maxPods - oldPods - newPods));
    newPods += add;
    if (remove === 0 && add === 0) throw new Error("ה־rollout תקוע");
    steps.push({ old: oldPods, new: newPods });
  }
  return { maxPods, minAvailable, steps };
}
