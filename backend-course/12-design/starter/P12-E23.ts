// P12-E23: תוקף שולח {"role": "admin"} — והופך למנהל!
// מותר רק: name (מחרוזת לא ריקה, עד 50) ו־bio (מחרוזת עד 200, אופציונלי). אחרים — מתעלמים.
// לא תקין → Error(`שדה לא תקין: ${field}`) | body לא אובייקט → Error("שדה לא תקין: body")
export type User = { id: number; name: string; bio: string; role: "user" | "admin" };
export type ProfileUpdate = { name?: string; bio?: string };

export function updateProfile(user: User, body: unknown): User {
  return { ...user, ...(body as ProfileUpdate) };
}
