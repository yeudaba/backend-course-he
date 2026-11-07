// P15.5-E07
export function formToTask(fields) {
  const task = {
    title: (fields.title ?? "").trim(),
    priority: fields.priority || "medium",
    dueDate: fields.dueDate || null,
  };
  if ("description" in fields) task.description = fields.description.trim() || null;
  return task;
}

console.log(JSON.stringify(formToTask({ title: "  ללמוד CORS ", priority: "", dueDate: "", submit: "" })));
console.log(JSON.stringify(formToTask({ title: "א", priority: "high", dueDate: "2026-12-01", description: "   " })));
