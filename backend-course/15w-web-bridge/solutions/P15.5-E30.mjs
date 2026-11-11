// P15.5-E30: אפשרויות של select מקוד
const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export function renderOptions(options, selected, placeholder) {
  const isSel = (v) => selected !== undefined && selected !== null && String(v) === String(selected);
  const option = (value, label, sel) => `<option value="${esc(value)}"${sel ? " selected" : ""}>${esc(label)}</option>`;
  const items = options.map((o) => option(o.value, o.label, isSel(o.value)));
  if (placeholder !== undefined) items.unshift(option("", placeholder, !options.some((o) => isSel(o.value))));
  return items.join("");
}

const cats = [{ value: 1, label: "ספרים" }, { value: 2, label: "R&D <כלים>" }];
console.log(renderOptions(cats, "2"));
console.log(renderOptions(cats, undefined, "בחר קטגוריה"));
