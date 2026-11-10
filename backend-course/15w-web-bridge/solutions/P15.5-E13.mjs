// P15.5-E13: טבלת HTML מנתונים
const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);

function renderCell(column, row) {
  const value = row[column.key];
  const text = value === null || value === undefined ? "—" : escapeHtml(value);
  return column.numeric ? `<td class="num">${text}</td>` : `<td>${text}</td>`;
}

export function renderTable(columns, rows) {
  if (rows.length === 0) {
    return '<p class="empty">אין נתונים להצגה</p>';
  }
  const head = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("");
  const body = rows.map((row) => `<tr>${columns.map((c) => renderCell(c, row)).join("")}</tr>`).join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

const columns = [
  { key: "name", label: "מוצר" },
  { key: "price", label: "מחיר", numeric: true },
];
console.log(renderTable(columns, [{ name: "כוס <קרמיקה>", price: 19.9 }, { name: "עט" }]));
console.log(renderTable(columns, []));
