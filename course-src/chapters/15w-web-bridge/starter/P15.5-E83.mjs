// P15.5-E83: רשימת משימות — כותרת מריצה קוד, הרשימה מוכפלת, ו־POST נכשל בשקט.
// renderList(doc, ul, tasks): li לכל משימה (כטקסט); ריק ← li.empty "אין משימות"
// createTask(apiBase, title, fetchFn = fetch): ‏POST ‏/tasks עם JSON; לא ok ← Error(body.error.message)
//
// בדיקה:  npm run check P15.5-E83
export function renderList(doc, ul, tasks) {
  if (tasks.length === 0) {
    ul.innerHTML = '<li class="empty">אין משימות</li>';
    return;
  }
  for (const t of tasks) {
    ul.innerHTML += `<li>${t.title}</li>`;
  }
}

export async function createTask(apiBase, title, fetchFn = fetch) {
  const res = await fetchFn(`${apiBase}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  return res.json();
}
