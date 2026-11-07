// P11-E18: בלי any ובלי as
export type User = { id: number; email: string; roles: string[] };

export function isUser(value: unknown): value is User {
  // כתוב כאן
}

// JSON של מערך → { users: התקינים, invalid: מספר הלא תקינים }
// JSON שבור / לא מערך → throw Error("הקלט אינו מערך JSON")
export function parseUsers(json: string): { users: User[]; invalid: number } {
  // כתוב כאן
}
