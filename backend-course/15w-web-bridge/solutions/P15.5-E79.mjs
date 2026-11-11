// P15.5-E79: שורת סיכום לרשימה
export function summarizeTasks(tasks, today) {
  const open = tasks.filter((t) => t.status !== "done");
  return {
    total: tasks.length,
    done: tasks.length - open.length,
    overdue: open.filter((t) => t.dueDate && t.dueDate < today).length,
    dueToday: open.filter((t) => t.dueDate === today).length,
  };
}

export function summaryText({ total, done, overdue, dueToday }) {
  if (total === 0) return "אין משימות";
  const parts = [total === 1 ? "משימה אחת" : `${total} משימות`];
  if (done) parts.push(`${done} בוצעו`);
  if (overdue) parts.push(`${overdue} באיחור`);
  if (dueToday) parts.push(`${dueToday} להיום`);
  return parts.join(" · ");
}

const today = "2026-11-11";
const tasks = [
  { id: 1, status: "done", dueDate: "2026-11-01" },
  { id: 2, status: "todo", dueDate: "2026-11-01" },
  { id: 3, status: "todo", dueDate: "2026-11-11" },
  { id: 4, status: "todo", dueDate: null },
  { id: 5, status: "done", dueDate: null },
];
const s = summarizeTasks(tasks, today);
console.log(s, summaryText(s));
console.log(summaryText(summarizeTasks([], today)), "|", summaryText(summarizeTasks([tasks[3]], today)));
