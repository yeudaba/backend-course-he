// P15.5-E15: טעינת לוח בקרה במקביל
export async function loadDashboard(getJson) {
  const [me, tasks, stats] = await Promise.allSettled([getJson("/me"), getJson("/tasks"), getJson("/stats")]);
  if (me.status === "rejected") {
    throw me.reason;
  }
  const errors = [];
  const valueOf = (result, name) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    errors.push(`${name}: ${result.reason.message}`);
    return null;
  };
  return { me: me.value, tasks: valueOf(tasks, "tasks"), stats: valueOf(stats, "stats"), errors };
}

const data = { "/me": { name: "דנה" }, "/tasks": [{ id: 1, title: "ללמוד CORS" }] };
const getJson = async (path) => {
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (!(path in data)) throw new Error("503 Service Unavailable");
  return data[path];
};

const start = Date.now();
const dashboard = await loadDashboard(getJson);
console.log(dashboard);
console.log(Date.now() - start < 100 ? "במקביל" : "אחד אחרי השני");
