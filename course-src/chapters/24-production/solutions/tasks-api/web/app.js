// הדף מדבר עם ה־API בכתובת הזו. בפריסה (פרק 25) — כתובת אחרת.
const API = "http://localhost:3000";

const $ = (selector) => document.querySelector(selector);
const PRIORITY_LABELS = { low: "נמוכה", medium: "בינונית", high: "גבוהה" };

// ---------- טוקנים (פרק 21) ----------
// access token — רק בזיכרון: נעלם ברענון הדף, ואז מבקשים חדש עם ה־refresh token.
// refresh token — ב־sessionStorage (נמחק כשסוגרים את הלשונית). בפרודקשן עדיף cookie עם HttpOnly — שיעור 3.
let accessToken = null;
const refreshStore = {
  get: () => sessionStorage.getItem("refreshToken"),
  set: (t) => (t ? sessionStorage.setItem("refreshToken", t) : sessionStorage.removeItem("refreshToken")),
};

function saveTokens(tokens) {
  accessToken = tokens?.accessToken ?? null;
  refreshStore.set(tokens?.refreshToken ?? null);
}

// מנסה לקבל access token חדש. מחזיר true אם הצליח
async function tryRefresh() {
  const refreshToken = refreshStore.get();
  if (!refreshToken) return false;
  const res = await fetch(API + "/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  saveTokens(res.ok ? await res.json() : null);
  return res.ok;
}

// בקשה ל־API: מחזירה JSON, ועל תשובה שאינה 2xx זורקת שגיאה עם ההודעה מהשרת.
// על 401 — מנסה refresh פעם אחת, ושולחת שוב.
async function request(path, options = {}, retry = true) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };
  const res = await fetch(API + path, { ...options, headers });
  if (res.status === 401 && retry) {
    if (await tryRefresh()) return request(path, options, false);
    showLoggedOut();
    throw new Error("צריך להתחבר מחדש");
  }
  // retry=false (כניסה, הרשמה): ה־401 הוא תשובה רגילה — "אימייל או סיסמה שגויים" — וממשיכים להודעה מהשרת
  if (res.status === 204) return undefined;
  const data = await res.json();
  if (!res.ok) {
    const details = data.error?.details?.map((d) => `${d.path}: ${d.message}`).join(", ");
    const message = details ? `${data.error.message} (${details})` : (data.error?.message ?? `HTTP ${res.status}`);
    // תקלה אצלנו: מציגים את ה־requestId — עם הקוד הזה מוצאים את הבקשה בלוגים (פרק 24)
    throw new Error(res.status >= 500 ? `${message} · קוד לתמיכה: ${res.headers.get("x-request-id")}` : message);
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
    // מפתח אחד לכל "שליחה" של הטופס: אם הרשת נופלת והדפדפן/המשתמש שולח שוב — לא תיווצר משימה כפולה
    form.dataset.key ??= crypto.randomUUID();
    await request("/tasks", { method: "POST", body: JSON.stringify(body), headers: { "Idempotency-Key": form.dataset.key } });
    delete form.dataset.key;
    form.reset();
    showError("");
    await loadTasks();
  } catch (err) {
    showError(err.message);
  }
});

$("#status-filter").addEventListener("change", loadTasks);

// ---------- כניסה, הרשמה ויציאה ----------
function showLoggedIn(user) {
  $("#auth").hidden = true;
  document.querySelectorAll(".app").forEach((el) => (el.hidden = false));
  $("#whoami").hidden = false;
  $("#whoami-email").textContent = user.email;
  loadTasks();
}

function showLoggedOut() {
  saveTokens(null);
  $("#auth").hidden = false;
  document.querySelectorAll(".app").forEach((el) => (el.hidden = true));
  $("#whoami").hidden = true;
  $("#tasks").replaceChildren();
}

function showAuthError(message) {
  $("#auth-error").textContent = message;
  $("#auth-error").hidden = !message;
}

async function login(email, password) {
  saveTokens(await request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, false));
  showAuthError("");
  showLoggedIn(await request("/auth/me"));
}

$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const fields = new FormData(event.target);
  try {
    await login(fields.get("email"), fields.get("password"));
  } catch (err) {
    showAuthError(err.message);
  }
});

$("#register").addEventListener("click", async () => {
  const form = $("#login-form");
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  try {
    await request("/auth/register", { method: "POST", body: JSON.stringify({ email: fields.get("email"), password: fields.get("password"), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }) }, false);
    await login(fields.get("email"), fields.get("password"));
  } catch (err) {
    showAuthError(err.message);
  }
});

$("#logout").addEventListener("click", async () => {
  const refreshToken = refreshStore.get();
  if (refreshToken) await request("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }, false).catch(() => {});
  showLoggedOut();
});

// בטעינת הדף: אם יש refresh token מהביקור הקודם בלשונית — ממשיכים מחוברים
(async () => {
  if (await tryRefresh()) showLoggedIn(await request("/auth/me"));
  else showLoggedOut();
})();
