// P11-E26: טיפוסים מטיפוסים
export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "member";
};

export type PublicUser = Omit<User, "passwordHash">;
export type UserPatch = Partial<Pick<User, "name" | "email">>;
export type RoleCounts = Record<User["role"], number>;

export function toPublic(u: User): PublicUser {
  const { passwordHash, ...rest } = u;
  return rest;
}

export function applyPatch(u: User, patch: UserPatch): User {
  return { ...u, ...patch };
}

export function countRoles(users: User[]): RoleCounts {
  const counts: RoleCounts = { admin: 0, member: 0 };
  for (const u of users) {
    counts[u.role]++;
  }
  return counts;
}

const dana: User = { id: 1, name: "דנה", email: "dana@x.com", passwordHash: "h1", role: "admin" };
console.log(toPublic(dana));
console.log(applyPatch(dana, { name: "דנה כ." }).name);
console.log(countRoles([dana]));
