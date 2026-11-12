// P26.5-E55: כמה פעמים כבר נכשלה? (x-death)
type Death = { queue?: string; reason?: string; count?: number };

export function deathCount(headers: Record<string, unknown> | undefined, queue: string, reason?: string) {
  const deaths = headers?.["x-death"];
  if (!Array.isArray(deaths)) return 0;
  return (deaths as Death[])
    .filter((d) => d.queue === queue && (reason === undefined || d.reason === reason))
    .reduce((s, d) => s + (typeof d.count === "number" ? d.count : 1), 0);
}
