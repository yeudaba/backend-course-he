// הדף מדבר עם ה־API בכתובת הזו. בפריסה (פרק 25) — כתובת אחרת.
const API = "http://localhost:3000";

const $ = (selector) => document.querySelector(selector);
const PRIORITY_LABELS = { low: "נמוכה", medium: "בינונית", high: "גבוהה" };

// בקשה ל־API: מחזירה JSON, ועל תשובה שאינה 2xx זורקת שגיאה עם ההודעה מהשרת
async function request(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: options.body ? { "Content-Type": "application/json" } : {},
  });
  if (res.status === 204) return undefined;
  const data = await res.json();
  if (!res.ok) {
    const details = data.error?.details?.map((d) => `${d.path}: ${d.message}`).join(", ");
    throw new Error(details ? `${data.error.message} (${details})` : (data.error?.message ?? `HTTP ${res.status}`));
  }
  return data;
}

function showError(message) {
  $("#error").textContent = message;
  $("#error").hidden = !message;
}

function renderTask(task) {
  const li = document.createElement("li");
  li.classList.toggle("done", task.status === "done");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.status === "done";
  checkbox.style.width = "auto";
  checkbox.addEventListener("change", () => updateTask(task.id, { status: checkbox.checked ? "done" : "todo" }));

  const title = document.createElement("span");
  title.className = "title";
  title.textContent = task.title; // textContent — לא innerHTML: כותרת כמו <img onerror=...> תוצג כטקסט

  const badge = document.createElement("span");
  badge.className = `badge ${task.priority}`;
  badge.textContent = PRIORITY_LABELS[task.priority] + (task.dueDate ? ` · ${task.dueDate}` : "");

  const remove = document.createElement("button");
  remove.className = "secondary";
  remove.textContent = "מחיקה";
  remove.addEventListener("click", () => deleteTask(task.id));

  li.append(checkbox, title, badge, remove);
  return li;
}

async function loadTasks() {
  const status = $("#status-filter").value;
  $("#loading").hidden = false;
  try {
    const { data } = await request(`/tasks?limit=50&sort=-priority${status ? `&status=${status}` : ""}`);
    $("#tasks").replaceChildren(...data.map(renderTask));
    $("#empty").hidden = data.length > 0;
    showError("");
  } catch (err) {
    showError(`לא הצלחנו לטעון משימות: ${err.message}`);
  } finally {
    $("#loading").hidden = true;
  }
}

async function updateTask(id, changes) {
  try {
    await request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
  } catch (err) {
    showError(err.message);
  }
  await loadTasks();
}

async function deleteTask(id) {
  try {
    await request(`/tasks/${id}`, { method: "DELETE" });
  } catch (err) {
    showError(err.message);
  }
  await loadTasks();
}

$("#new-task").addEventListener("submit", async (event) => {
  event.preventDefault(); // בלי זה הדפדפן "שולח" את הטופס בעצמו ומרענן את הדף
  const form = event.target;
  const fields = new FormData(form);
  const body = {
    title: fields.get("title"),
    priority: fields.get("priority"),
    dueDate: fields.get("dueDate") || null,
  };
  try {
    await request("/tasks", { method: "POST", body: JSON.stringify(body) });
    form.reset();
    showError("");
    await loadTasks();
  } catch (err) {
    showError(err.message);
  }
});

$("#status-filter").addEventListener("change", loadTasks);

loadTasks();
