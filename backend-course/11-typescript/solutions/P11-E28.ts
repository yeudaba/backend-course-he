// P11-E28: שליפת משתמשים
export type User = { id: number; name: string };

export async function findUsers(
  ids: number[],
  getUser: (id: number) => Promise<User | undefined>
): Promise<{ found: User[]; missing: number[] }> {
  const unique = [...new Set(ids)];
  const results = await Promise.all(unique.map(getUser));
  const found: User[] = [];
  const missing: number[] = [];
  unique.forEach((id, i) => {
    const user = results[i];
    if (user) {
      found.push(user);
    } else {
      missing.push(id);
    }
  });
  return { found, missing };
}

const db = new Map<number, User>([
  [1, { id: 1, name: "דנה" }],
  [3, { id: 3, name: "עומר" }],
]);
const getUser = async (id: number) => db.get(id);

console.log(await findUsers([3, 2, 1, 3], getUser));
