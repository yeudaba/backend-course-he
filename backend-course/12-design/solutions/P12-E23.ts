// P12-E23: מתוקן — רשימת שדות מותרים
export type User = { id: number; name: string; bio: string; role: "user" | "admin" };
export type ProfileUpdate = { name?: string; bio?: string };

export function updateProfile(user: User, body: unknown): User {
  if (typeof body !== "object" || body === null) {
    throw new Error("שדה לא תקין: body");
  }
  const { name, bio } = body as Record<string, unknown>;
  const update: ProfileUpdate = {};
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "" || name.length > 50) {
      throw new Error("שדה לא תקין: name");
    }
    update.name = name.trim();
  }
  if (bio !== undefined) {
    if (typeof bio !== "string" || bio.length > 200) {
      throw new Error("שדה לא תקין: bio");
    }
    update.bio = bio;
  }
  return { ...user, ...update };
}

console.log(updateProfile({ id: 1, name: "a", bio: "", role: "user" }, { name: "דנה", role: "admin" }));
