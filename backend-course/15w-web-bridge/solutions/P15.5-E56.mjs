// P15.5-E56: רשימת משימות ב־DOM
export function renderTasks(doc, ul, tasks) {
  if (tasks.length === 0) {
    const li = doc.createElement("li");
    li.classList.add("empty");
    li.textContent = "אין משימות";
    ul.replaceChildren(li);
    return;
  }
  ul.replaceChildren(
    ...tasks.map((t) => {
      const li = doc.createElement("li");
      li.textContent = t.title;
      li.dataset.id = t.id;
      li.classList.toggle("done", t.done);
      return li;
    }),
  );
}
