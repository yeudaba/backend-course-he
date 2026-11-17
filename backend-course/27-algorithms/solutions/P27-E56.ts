// P27-E56: מה השתנה? diff של שני אובייקטים
export function diffObjects(before: Record<string, unknown>, after: Record<string, unknown>) {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: { key: string; from: unknown; to: unknown }[] = [];
  for (const k of Object.keys(before)) {
    if (!Object.hasOwn(after, k)) removed.push(k);
    else if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) changed.push({ key: k, from: before[k], to: after[k] });
  }
  for (const k of Object.keys(after)) if (!Object.hasOwn(before, k)) added.push(k);
  const byKey = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
  return { added: added.sort(byKey), removed: removed.sort(byKey), changed: changed.sort((a, b) => byKey(a.key, b.key)) };
}
