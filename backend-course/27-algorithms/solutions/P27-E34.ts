// P27-E34: לחבר הזמנות למשתמשים — O(n + m)
export function attachUsers<U extends { id: number }, O extends { userId: number }>(users: U[], orders: O[]) {
  const byId = new Map(users.map((u) => [u.id, u]));
  return orders.map((o) => ({ ...o, user: byId.get(o.userId) ?? null }));
}
