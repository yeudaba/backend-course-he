// P10-E11: כמו E09 — אבל עם async/await
const users = [{ id: 1, name: "דנה" }, { id: 2, name: "עומר" }];
const orders = [{ userId: 1 }, { userId: 1 }, { userId: 2 }];
const wait = (v) => new Promise((r) => setTimeout(() => r(v), 5));
const findUser = (id) => wait(users.find((u) => u.id === id) ?? null);
const findOrders = (userId) => wait(orders.filter((o) => o.userId === userId));

async function orderCountText(userId) {
  // כתוב כאן
}

module.exports = { orderCountText };
