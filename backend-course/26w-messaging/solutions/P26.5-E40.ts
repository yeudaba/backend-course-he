// P26.5-E40: מי מקבל מה — תור מול log
export function deliver(model: "queue" | "log", groups: Record<string, string[]>, messages: string[]) {
  const out: Record<string, string[]> = {};
  for (const c of Object.values(groups).flat()) out[c] = [];
  const spread = (consumers: string[]) => messages.forEach((m, i) => consumers.length && out[consumers[i % consumers.length]].push(m));
  if (model === "queue") spread(Object.values(groups).flat());
  else for (const consumers of Object.values(groups)) spread(consumers);
  return out;
}
