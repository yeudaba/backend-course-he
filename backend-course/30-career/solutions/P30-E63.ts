// P30-E63: כל מספר — שאלת ראיון
const NUM = /(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)(?: ?(%|ms|x|×|\+|k))?/g;

export function numbersToExplain(text: string) {
  const out: { value: string; unit: string; sentence: string }[] = [];
  const sentences = text
    .split(/\n|(?<=[.!?])\s+/)
    .map((s) => s.trim().replace(/^[-*]\s+/, ""))
    .filter(Boolean);
  for (const sentence of sentences) {
    for (const m of sentence.matchAll(NUM)) {
      const value = m[1];
      const unit = m[2] ?? "";
      if (!unit && /^(19|20)\d{2}$/.test(value)) continue;
      out.push({ value, unit, sentence });
    }
  }
  return out;
}
