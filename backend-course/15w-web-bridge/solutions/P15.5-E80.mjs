// P15.5-E80: קבוצות לפי עדיפות
const ORDER = ["high", "medium", "low", "other"];
const due = (t) => t.dueDate ?? "9999-12-31";

function compare(a, b) {
  return (a.status === "done") - (b.status === "done") || due(a).localeCompare(due(b)) || a.id - b.id;
}

export function groupByPriority(tasks) {
  const groups = new Map(ORDER.map((p) => [p, []]));
  for (const t of tasks) groups.get(ORDER.includes(t.priority) && t.priority !== "other" ? t.priority : "other").push(t);
  for (const [key, list] of groups) {
    if (list.length === 0) groups.delete(key);
    else list.sort(compare);
  }
  return groups;
}

const tasks = [
  { id: 1, priority: "low", status: "todo", dueDate: null },
  { id: 2, priority: "high", status: "done", dueDate: "2026-11-01" },
  { id: 3, priority: "high", status: "todo", dueDate: "2026-11-20" },
  { id: 4, priority: "high", status: "todo", dueDate: "2026-11-05" },
  { id: 5, priority: "urgent", status: "todo", dueDate: null },
  { id: 6, priority: "high", status: "todo", dueDate: null },
];
for (const [priority, list] of groupByPriority(tasks)) console.log(priority, list.map((t) => t.id));
