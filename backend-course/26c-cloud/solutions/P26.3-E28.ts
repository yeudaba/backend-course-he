// P26.3-E28 — סיכום של kubectl get pods
export type Pod = { name: string; ready: number; total: number; status: string; restarts: number; age: string };

export function parsePods(text: string): Pod[] {
  const [header, ...rows] = text.trim().split("\n");
  const cols = header.trim().split(/\s{2,}/);
  const at = (name: string) => {
    const i = cols.indexOf(name);
    if (i === -1) throw new Error(`חסרה עמודה ${name}`);
    return i;
  };
  const [NAME, READY, STATUS, RESTARTS, AGE] = ["NAME", "READY", "STATUS", "RESTARTS", "AGE"].map(at);
  return rows
    .filter((row) => row.trim() !== "")
    .map((row) => {
      const cells = row.trim().split(/\s{2,}/);
      const [ready, total] = cells[READY].split("/").map(Number);
      return {
        name: cells[NAME],
        ready,
        total,
        status: cells[STATUS],
        restarts: parseInt(cells[RESTARTS], 10),
        age: cells[AGE],
      };
    });
}

export function podSummary(pods: Pod[]) {
  const byStatus: Record<string, number> = {};
  for (const pod of pods) byStatus[pod.status] = (byStatus[pod.status] ?? 0) + 1;
  const notReady = pods.filter((p) => p.ready < p.total && p.status !== "Completed").map((p) => p.name);
  const restarting = pods
    .filter((p) => p.restarts >= 3)
    .sort((a, b) => b.restarts - a.restarts || a.name.localeCompare(b.name))
    .map((p) => `${p.name} (${p.restarts})`);
  return { byStatus, notReady, restarting };
}

const output = `NAME                         READY   STATUS             RESTARTS        AGE
coffee-api-7d9f8b6c4-2xkqp   1/1     Running            0               3d4h
coffee-api-7d9f8b6c4-9wzlm   1/1     Running            1 (2d ago)      3d4h
coffee-api-7d9f8b6c4-tq7rn   0/1     CrashLoopBackOff   14 (63s ago)    48m
worker-6c5d7f9b8-hk2vd       1/2     Running            3 (10m ago)     2h
postgres-0                   1/1     Running            0               12d
migrate-q8x2n                0/1     Completed          0               3d4h
`;
const pods = parsePods(output);
console.log(pods[2]);
console.log(podSummary(pods));
