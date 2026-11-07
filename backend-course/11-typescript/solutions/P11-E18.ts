// P11-E18
export type User = { id: number; email: string; roles: string[] };

export function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number" &&
    "email" in value &&
    typeof value.email === "string" &&
    "roles" in value &&
    Array.isArray(value.roles) &&
    value.roles.every((r: unknown) => typeof r === "string")
  );
}

export function parseUsers(json: string): { users: User[]; invalid: number } {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("הקלט אינו מערך JSON");
  }
  if (!Array.isArray(data)) {
    throw new Error("הקלט אינו מערך JSON");
  }
  const users = data.filter(isUser);
  return { users, invalid: data.length - users.length };
}

console.log(JSON.stringify(parseUsers('[{"id":1,"email":"a@b.c","roles":["admin"]},{"id":"2"}]')));
