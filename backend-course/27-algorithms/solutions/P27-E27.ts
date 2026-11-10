// P27-E27 — מיזוג רשימות ממוינות
export function mergeSorted(a: number[], b: number[]): number[] {
  const out: number[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}

export function mergeAll(lists: number[][]): number[] {
  if (lists.length === 0) return [];
  let round = lists;
  while (round.length > 1) {
    const next: number[][] = [];
    for (let k = 0; k < round.length; k += 2) {
      next.push(k + 1 < round.length ? mergeSorted(round[k], round[k + 1]) : round[k]);
    }
    round = next;
  }
  return round[0];
}

console.log(mergeSorted([1, 4, 9], [2, 3, 10, 11]));
console.log(mergeAll([[5, 20], [1, 2, 30], [], [7], [3, 3]]));
