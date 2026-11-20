// P28-E92: חיבורים למסד — האם נכנסים?
export function poolBudget(p: { instances: number; poolPerInstance: number; workers?: number; poolPerWorker?: number; maxConnections: number; reserved?: number }) {
  const { instances, poolPerInstance, workers = 0, poolPerWorker = 0, maxConnections, reserved = 3 } = p;
  const total = instances * poolPerInstance + workers * poolPerWorker;
  const available = maxConnections - reserved;
  return {
    total,
    available,
    ok: total < available,
    maxPoolPerInstance: Math.max(0, Math.floor((available - workers * poolPerWorker) / instances)),
  };
}
