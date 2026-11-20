// P30-E71: בדיקת מבנה STAR
const LABEL = /^\s*(s|t|a|r|situation|task|action|result):\s*(.*)$/i;
const countWords = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

export function starCheck(answer: string) {
  const parts: { key: string; text: string }[] = [];
  for (const line of answer.split("\n")) {
    const m = LABEL.exec(line);
    if (m) parts.push({ key: m[1][0].toUpperCase(), text: m[2] });
    else if (parts.length) parts.at(-1)!.text += "\n" + line;
  }
  const order = "STAR";
  const keys = parts.map((p) => p.key);
  const missing = [...order].filter((k) => !keys.includes(k));
  const idx = keys.map((k) => order.indexOf(k));
  const outOfOrder = idx.some((v, i) => i > 0 && v < idx[i - 1]);
  const total = parts.reduce((s, p) => s + countWords(p.text), 0);
  const action = parts.filter((p) => p.key === "A").reduce((s, p) => s + countWords(p.text), 0);
  return { missing, outOfOrder, actionShare: total ? Math.round((action / total) * 100) / 100 : 0 };
}
