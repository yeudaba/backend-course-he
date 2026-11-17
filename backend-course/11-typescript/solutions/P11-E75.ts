// P11-E75: משימה מ־JSON
export type Todo = { title: string; done: boolean; priority?: "low" | "high" };

export function parseTodo(json: string): Todo | null {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
  if (!("title" in data) || typeof data.title !== "string" || data.title.trim() === "") return null;
  if (!("done" in data) || typeof data.done !== "boolean") return null;
  const todo: Todo = { title: data.title, done: data.done };
  if ("priority" in data) {
    if (data.priority !== "low" && data.priority !== "high") return null;
    todo.priority = data.priority;
  }
  return todo;
}

console.log(parseTodo('{"title": "לקנות חלב", "done": false, "extra": 1}'));
console.log(parseTodo('{"title": "x", "done": true, "priority": "high"}'));
console.log(parseTodo('{"title": "x", "done": "no"}'), parseTodo("{oops"), parseTodo("[]"));
