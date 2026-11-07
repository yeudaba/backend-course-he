// P15.5-E11: מתוקן
const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, (ch) => ENTITIES[ch]);

export function renderComments(comments) {
  const items = comments.map((c) => `<li><b>${escapeHtml(c.author || "אנונימי")}</b>: ${escapeHtml(c.text)}</li>`);
  return `<ul>${items.join("")}</ul>`;
}

export async function postComment(baseUrl, text) {
  const res = await fetch(`${baseUrl}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? `HTTP ${res.status}`);
  return data;
}
