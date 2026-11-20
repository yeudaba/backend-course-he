// P30-E70: כמה זמן ייקח להגיד את זה
export function speakingTime(text: string, wpm = 130): { words: number; seconds: number; verdict: "short" | "ok" | "long" } {
  if (!(wpm > 0)) throw new RangeError("wpm חייב להיות חיובי");
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  const seconds = Math.round((words / wpm) * 60);
  return { words, seconds, verdict: seconds <= 90 ? "short" : seconds > 150 ? "long" : "ok" };
}
