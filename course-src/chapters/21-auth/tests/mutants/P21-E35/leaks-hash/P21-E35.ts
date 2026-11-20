// P21-E35: toPublicUser — רשימה מפורשת של מה שיוצא
export type User = { id: number; email: string; passwordHash: string; role: "user" | "admin"; createdAt: string };
export type PublicUser = Omit<User, "passwordHash">;

export function toPublicUser(user: User): PublicUser {
  const { ...rest } = user; return rest;
}

export function toPublicUsers(users: User[]): PublicUser[] {
  return users.map(toPublicUser);
}
