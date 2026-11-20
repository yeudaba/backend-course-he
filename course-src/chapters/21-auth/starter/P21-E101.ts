// P21-E101: הרשמה וכניסה — ארבע תקלות אבטחה. הדרישות בדף התרגול.
// register(users, email, password, rounds = 12) ← { email } · login(users, email, password) ← { email }
// כניסה שנכשלה (אימייל או סיסמה) ← Error("אימייל או סיסמה שגויים")
//
// בדיקה:  npm run check P21-E101
import bcrypt from "bcryptjs";

export interface StoredUser {
  email: string;
  passwordHash: string;
}

export async function register(users: Map<string, StoredUser>, email: string, password: string, rounds = 12) {
  const key = email.trim().toLowerCase();
  if (users.has(key)) throw new Error("האימייל כבר רשום");
  const passwordHash = await bcrypt.hash(password, rounds);
  users.set(email, { email: key, passwordHash });
  return { email: key, passwordHash };
}

export async function login(users: Map<string, StoredUser>, email: string, password: string) {
  const user = users.get(email.trim().toLowerCase());
  if (!user) throw new Error("אימייל לא קיים");
  const ok = bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("סיסמה שגויה");
  return { email: user.email };
}
