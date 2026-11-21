// P15.5-E83: רשימת משימות — מתוקן
export function renderList(doc, ul, tasks) {
  if (tasks.length === 0) {
    const li = doc.createElement("li");
    li.className = "empty";
    li.textContent = "אין משימות";
    ul.replaceChildren(li);
    return;
  }
  ul.replaceChildren(
    ...tasks.map((t) => {
      const li = doc.createElement("li");
      li.textContent = t.title;
      return li;
    })
  );
}

export async function createTask(apiBase, title, fetchFn = fetch) {
  const res = await fetchFn(`${apiBase}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error.message);
  return body;
}
