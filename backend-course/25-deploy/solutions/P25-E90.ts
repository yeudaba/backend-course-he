// P25-E90: ההודעות של בדיקת העשן
const short = (sha: string) => sha.slice(0, 7);

export function waitingLine(n: number, v: { status: number; commit?: string; error?: string }, expect: string | null): string {
  let line = `#${n}: /version ← ${v.status || v.error}`;
  if (v.commit) {
    line += `, commit ${short(v.commit)}`;
    if (expect) line += ` (מחכים ל־${short(expect)})`;
  }
  return line;
}

export function notReadyLine(n: number, status: number): string {
  return `#${n}: הגרסה החדשה רצה, אבל /ready ← ${status}`;
}

export function successLine(base: string, commit: string, seconds: number): string {
  return `✔ ${base} — commit ${short(commit)}, ready (${Math.round(seconds)}s)`;
}

export function failLine(expect: string | null, timeoutSeconds: number): string {
  return `✖ הגרסה${expect ? ` ${short(expect)}` : ""} לא עלתה תוך ${timeoutSeconds} שניות`;
}
