// P29-E59: להציג תשובה של מודל ב־HTML
const MAP: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function renderAnswer(text: string): string {
  const safe = text.replace(/[&<>"']/g, (c) => MAP[c]).replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  return safe
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p !== "")
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
