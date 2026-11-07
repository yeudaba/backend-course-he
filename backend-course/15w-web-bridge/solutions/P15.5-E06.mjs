// P15.5-E06
const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);
}

export function renderTaskItem(task) {
  return `<li class="task ${escapeHtml(task.priority)}">${escapeHtml(task.title)}</li>`;
}

console.log(renderTaskItem({ title: '<img src=x onerror="alert(1)">', priority: "high" }));
console.log(renderTaskItem({ title: "Tom & Jerry", priority: 'x" onclick="alert(1)' }));
