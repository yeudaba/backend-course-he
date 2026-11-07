// P10-E11
const users = [{ id: 1, name: "דנה" }, { id: 2, name: "עומר" }];
const orders = [{ userId: 1 }, { userId: 1 }, { userId: 2 }];
const wait = (v) => new Promise((r) => setTimeout(() => r(v), 5));
const findUser = (id) => wait(users.find((u) => u.id === id) ?? null);
const findOrders = (userId) => wait(orders.filter((o) => o.userId === userId));

async function orderCountText(userId) {
  const user = await findUser(userId);
  if (user === null) {
    throw new Error("משתמש לא נמצא");
  }
  const list = await findOrders(user.id);
  return `${user.name}: ${list.length} הזמנות`;
}

orderCountText(2).then(console.log);

module.exports = { orderCountText };
