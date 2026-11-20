// P29-E99: מקרי eval מתוך הלוגים
const redact = (s: string) =>
  s.replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[EMAIL]").replace(/\b05\d[- ]?\d{3}[- ]?\d{4}\b/g, "[PHONE]");

export function evalCasesFromLogs(lines: string[]) {
  const seen = new Set<string>();
  const cases: { name: string; input: string; badAnswer: string }[] = [];
  lines.forEach((line, i) => {
    if (!line.trim()) return;
    let obj: any;
    try {
      obj = JSON.parse(line);
    } catch {
      return;
    }
    if (!obj || typeof obj !== "object" || obj.msg !== "ai_answer" || obj.feedback !== "bad") return;
    const input = redact(String(obj.question ?? ""));
    const norm = input.replace(/\s+/g, " ").toLowerCase();
    if (seen.has(norm)) return;
    seen.add(norm);
    cases.push({ name: obj.reqId ?? `line-${i + 1}`, input, badAnswer: redact(String(obj.answer ?? "")) });
  });
  return cases;
}
