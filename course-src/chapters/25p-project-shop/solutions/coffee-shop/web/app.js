// דף ההדגמה של החנות. מדבר עם ה־API — מקומית localhost:3000, בפריסה מ־<meta name="api-url">
const local = ["localhost", "127.0.0.1"].includes(location.hostname);
const API = local ? "http://localhost:3000" : document.querySelector('meta[name="api-url"]')?.content;
const $ = (s) => document.querySelector(s);
const money = (cents) => `₪${(cents / 100).toFixed(2)}`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
let token = sessionStorage.getItem("token");

function show(text, kind = "ok") {
  $("#message").textContent = text;
  $("#message").className = kind;
}

async function api(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? `HTTP ${res.status}`);
  return data;
}

async function loadProducts(event) {
  event?.preventDefault();
  const params = new URLSearchParams([...new FormData($("#search"))].filter(([, v]) => v !== ""));
  const { data } = await api(`/products?${params}`);
  $("#products").innerHTML = data
    .map((p) => `<li><strong>${esc(p.name)}</strong><span class="muted">${esc(p.description)}</span><span>${money(p.priceCents)}</span>
      <span class="muted">${p.stock > 0 ? `במלאי: ${p.stock}` : "אזל"}</span>
      <button data-add="${p.id}" ${p.stock > 0 && token ? "" : "disabled"}>להוסיף לעגלה</button></li>`)
    .join("") || "<li>לא נמצאו מוצרים</li>";
}

async function loadCart() {
  if (!token) return;
  const cart = await api("/cart");
  $("#cart").innerHTML = cart.items.map((i) => `<li>${esc(i.name)} × ${i.quantity} — ${money(i.lineTotalCents)} <button class="secondary" data-remove="${i.productId}">✕</button></li>`).join("") || "<li class='muted'>העגלה ריקה</li>";
  $("#cart-total").textContent = money(cart.totalCents);
}

const STATUS = { pending_payment: "ממתינה לתשלום", paid: "שולמה", shipped: "נשלחה", cancelled: "בוטלה" };
async function loadOrders() {
  if (!token) return;
  const { data } = await api("/orders");
  $("#orders").innerHTML = data
    .map((o) => `<li>#${o.id} · ${money(o.totalCents)} · ${STATUS[o.status]}
      ${o.status === "pending_payment" ? `<button data-pay="${o.id}">תשלום</button>` : ""}
      ${["pending_payment", "paid"].includes(o.status) ? `<button class="secondary" data-cancel="${o.id}">ביטול</button>` : ""}</li>`)
    .join("") || "<li class='muted'>אין עדיין</li>";
}

async function refresh() {
  $("#login-box").hidden = Boolean(token);
  $("#account").innerHTML = token ? `<button class="secondary" id="logout">יציאה</button>` : "";
  await Promise.all([loadProducts(), loadCart(), loadOrders()]);
}

$("#search").addEventListener("submit", (e) => loadProducts(e).catch((err) => show(err.message, "error")));

$("#login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    token = (await api("/auth/login", { method: "POST", body: { email: f.get("email"), password: f.get("password") } })).accessToken;
    sessionStorage.setItem("token", token);
    show("התחברת");
    await refresh();
  } catch (err) {
    show(err.message, "error");
  }
});

$("#register").addEventListener("click", async () => {
  const f = new FormData($("#login"));
  try {
    await api("/auth/register", { method: "POST", body: { email: f.get("email"), password: f.get("password"), name: f.get("name") || "לקוח" } });
    show("נרשמת — עכשיו כניסה");
  } catch (err) {
    show(err.message, "error");
  }
});

// מפתח אחד לכל "לחיצה על הזמן" — אם הרשת נופלת ושולחים שוב, השרת לא ייצור הזמנה שנייה
let checkoutKey = null;
$("#checkout").addEventListener("click", async () => {
  checkoutKey ??= crypto.randomUUID();
  $("#checkout").disabled = true;
  try {
    const order = await api("/orders", { method: "POST", headers: { "Idempotency-Key": checkoutKey } });
    checkoutKey = null;
    show(`הזמנה #${order.id} נוצרה — ${money(order.totalCents)}. לתשלום: כרטיס 4242 4242 4242 4242`);
    await refresh();
  } catch (err) {
    show(err.message, "error");
  } finally {
    $("#checkout").disabled = false;
  }
});

document.addEventListener("click", async (e) => {
  const { add, remove, pay, cancel } = e.target.dataset ?? {};
  try {
    if (e.target.id === "logout") {
      token = null;
      sessionStorage.removeItem("token");
      return await refresh();
    }
    if (add) {
      const cart = await api("/cart");
      const current = cart.items.find((i) => i.productId === Number(add))?.quantity ?? 0;
      await api(`/cart/items/${add}`, { method: "PUT", body: { quantity: current + 1 } });
    }
    if (remove) await api(`/cart/items/${remove}`, { method: "DELETE" });
    if (pay) {
      const card = prompt("מספר כרטיס (בדיקה: 4242424242424242, נדחה: 4000000000000002)");
      if (!card) return;
      await api(`/orders/${pay}/pay`, { method: "POST", body: { cardNumber: card }, headers: { "Idempotency-Key": crypto.randomUUID() } });
      show("שולם ✔");
    }
    if (cancel) {
      await api(`/orders/${cancel}/cancel`, { method: "POST" });
      show("ההזמנה בוטלה, המלאי חזר");
    }
    if (add || remove || pay || cancel) await refresh();
  } catch (err) {
    show(err.message, "error");
  }
});

refresh().catch((err) => show(`אין חיבור ל־API (${API}): ${err.message}`, "error"));
