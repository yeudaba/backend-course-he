// P29-E26 — לחלק מסמכים לקטעים, ולמצוא את הרלוונטיים
function splitLong(paragraph: string, maxChars: number): string[] {
  const pieces: string[] = [];
  for (const sentence of paragraph.split(/(?<=[.!?])\s+/)) {
    for (let i = 0; i < sentence.length; i += maxChars) pieces.push(sentence.slice(i, i + maxChars));
  }
  return pieces;
}

export function chunk(text: string, maxChars = 500): string[] {
  if (!Number.isInteger(maxChars) || maxChars < 1) throw new RangeError("maxChars חייב להיות מספר שלם חיובי");
  const parts = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p !== "")
    .flatMap((p) => (p.length > maxChars ? splitLong(p, maxChars) : [p]));

  const chunks: string[] = [];
  let current = "";
  for (const part of parts) {
    const joined = current === "" ? part : `${current}\n\n${part}`;
    if (joined.length <= maxChars) {
      current = joined;
    } else {
      chunks.push(current);
      current = part;
    }
  }
  if (current !== "") chunks.push(current);
  return chunks;
}

const words = (text: string) => new Set(text.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []);

export function retrieve(chunks: string[], question: string, k = 3): { index: number; score: number; text: string }[] {
  const q = words(question);
  return chunks
    .map((text, index) => {
      const w = words(text);
      let score = 0;
      for (const word of q) if (w.has(word)) score++;
      return { index, score, text };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, k);
}

const policy = `משלוחים
משלוח רגיל לכל הארץ תוך 3-5 ימי עסקים. משלוח חינם בהזמנה מעל 200 ₪.

החזרות
אפשר להחזיר מוצר שלא נפתח תוך 14 יום. פולי קפה שנפתחו לא ניתנים להחזרה.

אחריות
מטחנות חשמליות: אחריות לשנתיים. מטחנות ידניות: שנה. האחריות לא כוללת נזק ממים.`;
const chunks = chunk(policy, 120);
console.log(chunks.map((c) => `[${c.length}] ${c.split("\n")[0]}`));
console.log(retrieve(chunks, "כמה זמן אחריות יש על מטחנות?", 2).map((c) => [c.index, c.score]));
console.log(retrieve(chunks, "האם אפשר להחזיר פולי קפה?").map((c) => [c.index, c.score]));
