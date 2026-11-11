// P15.5-E69: שורת משימה עם אירועים
export function renderTask(doc, task, { onToggle, onDelete }) {
  const el = (tag, cls, text) => {
    const e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const done = task.status === "done";
  const li = el("li", done ? "row done" : "row");
  li.dataset.id = task.id;

  const box = el("input");
  box.type = "checkbox";
  box.checked = done;
  box.addEventListener("change", () => onToggle(task.id, box.checked));

  let due = "בלי תאריך";
  if (task.dueDate) {
    const [y, m, d] = task.dueDate.split("-");
    due = `${d}.${m}.${y}`;
  }

  const del = el("button", "danger", "מחיקה");
  del.addEventListener("click", () => onDelete(task.id));

  li.append(box, el("span", "title", task.title), el("span", "meta", `${task.priority} · ${due}`), del);
  return li;
}
