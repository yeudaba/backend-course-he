// P28-E26 — quorum: כמה העתקים צריכים להסכים
export type Replica = { up: boolean; version: number; value: string | null };

export function isStrong(n: number, r: number, w: number): boolean {
  return r + w > n;
}

export function quorumWrite(replicas: Replica[], w: number, value: string, version: number): boolean {
  let acks = 0;
  for (const replica of replicas) {
    if (!replica.up) continue;
    replica.version = version;
    replica.value = value;
    acks++;
  }
  return acks >= w;
}

export function quorumRead(replicas: Replica[], r: number): { value: string | null; version: number; repaired: number } {
  const answered = replicas.filter((rep) => rep.up).slice(0, r);
  if (answered.length < r) throw new Error(`רק ${answered.length} העתקים זמינים, צריך ${r}`);
  const newest = answered.reduce((best, rep) => (rep.version > best.version ? rep : best));
  let repaired = 0;
  for (const rep of answered) {
    if (rep.version < newest.version) {
      rep.version = newest.version;
      rep.value = newest.value;
      repaired++;
    }
  }
  return { value: newest.value, version: newest.version, repaired };
}

const replicas: Replica[] = [
  { up: true, version: 0, value: null },
  { up: true, version: 0, value: null },
  { up: true, version: 0, value: null },
];
console.log("N=3, R=2, W=2 strong?", isStrong(3, 2, 2), "· R=1, W=1?", isStrong(3, 1, 1));
replicas[2].up = false;
console.log("write v1:", quorumWrite(replicas, 2, "address: Haifa", 1));
replicas[2].up = true;
replicas[0].up = false;
console.log("read:", quorumRead(replicas, 2));
console.log(replicas.map((r) => `${r.version}:${r.value}`));
