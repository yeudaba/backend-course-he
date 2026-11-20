// P21-E101: הרשמה וכניסה — מתוקן
import bcrypt from "bcryptjs";

export interface StoredUser {
  email: string;
  passwordHash: string;
}

const normalize = (email: string) => email.trim().toLowerCase();
const BAD_LOGIN = "אימייל או סיסמה שגויים";

export async function register(users: Map<string, StoredUser>, email: string, password: string, rounds = 12) {
  const key = normalize(email);
  if (users.has(key)) throw new Error("האימייל כבר רשום");
  const passwordHash = await bcrypt.hash(password, rounds);
  users.set(key, { email: key, passwordHash });
  return { email: key };
}

export async function login(users: Map<string, StoredUser>, email: string, password: string) {
  const user = users.get(normalize(email));

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error(BAD_LOGIN);
  return { email: user.email };
}
