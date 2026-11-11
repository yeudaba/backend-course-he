// P15.5-E31: בודק תוויות לטופס
function tags(html) {
  return [...html.matchAll(/<(\w+)([^>]*)>/g)].map((m) => {
    const attrs = {};
    for (const a of m[2].matchAll(/([\w-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g)) {
      attrs[a[1].toLowerCase()] = (a[2] ?? "").replace(/^["']|["']$/g, "");
    }
    return { tag: m[1].toLowerCase(), attrs };
  });
}

export function checkForm(html) {
  const list = tags(html);
  const problems = [];
  const counts = new Map();
  for (const t of list) if (t.attrs.id) counts.set(t.attrs.id, (counts.get(t.attrs.id) ?? 0) + 1);
  for (const [id, n] of counts) if (n > 1) problems.push(`id כפול: ${id}`);

  const labelsFor = new Set(list.filter((t) => t.tag === "label" && t.attrs.for).map((t) => t.attrs.for));
  for (const t of list) {
    if (!["input", "select", "textarea"].includes(t.tag)) continue;
    if (["submit", "hidden", "button"].includes((t.attrs.type ?? "").toLowerCase())) continue;
    if (!t.attrs.name) problems.push(`שדה בלי name: ${t.attrs.id || "?"}`);
    if (!t.attrs.id || !labelsFor.has(t.attrs.id)) problems.push(`שדה בלי label: ${t.attrs.name || "?"}`);
  }
  for (const t of list) {
    if (t.tag === "label" && t.attrs.for && !counts.has(t.attrs.for)) problems.push(`label יתום: ${t.attrs.for}`);
  }
  return problems;
}

console.log(
  checkForm(`<form>
  <label for="email">אימייל</label><input id="mail" name="email" type="email">
  <label for='phone'>טלפון</label><input id=phone type="tel">
  <input type="hidden" name="csrf"><button type="submit">שלח</button>
  <p id="note"></p><span id="note"></span>
</form>`),
);
