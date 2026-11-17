// P15.5-E68: כתובת לרשימה המסוננת
export function tasksPath({ status, q, page } = {}) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (q && q.trim()) params.set("q", q.trim());
  if (page > 1) params.set("page", String(page));
  return `/tasks${params.size ? "?" + params : ""}`;
}

console.log(tasksPath({ status: "open", q: " חלב ", page: 1 }));
console.log(tasksPath({ status: "all", q: "   " }));
console.log(tasksPath({ q: "red shoes", page: 3 }));
console.log(tasksPath());
