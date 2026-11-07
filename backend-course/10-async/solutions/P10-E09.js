// P10-E09
const users = [{ id: 1, name: "דנה" }, { id: 2, name: "עומר" }];
const orders = [{ userId: 1 }, { userId: 1 }, { userId: 2 }];
const wait = (v) => new Promise((r) => setTimeout(() => r(v), 5));
const findUser = (id) => wait(users.find((u) => u.id === id) ?? null);
const findOrders = (userId) => wait(orders.filter((o) => o.userId === userId));

function orderCountText(userId) {
  return findUser(userId).then((user) => {
    if (user === null) {
      throw new Error("משתמש לא נמצא");
    }
    return findOrders(user.id).then((list) => `${user.name}: ${list.length} הזמנות`);
  });
}

orderCountText(1)
  .then(console.log)
  .then(() => orderCountText(9))
  .catch((e) => console.log(e.message));

module.exports = { findUser, findOrders, orderCountText };
