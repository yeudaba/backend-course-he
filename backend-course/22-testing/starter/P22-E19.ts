// P22-E19 — הקוד שבודקים (לא משנים אותו)
export class AuthError extends Error {}

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
}

interface User {
  id: number;
  email: string;
  password: string; // בתרגיל — טקסט, כדי להתמקד בבדיקות. (בפרק 21 — bcrypt)
}

// כניסה: אימייל מנורמל, אותה הודעה לכל כישלון, ולוג בלי סיסמאות
export function createLogin(users: User[], log: Logger) {
  return async (email: string, password: string): Promise<{ userId: number }> => {
    const normalized = email.trim().toLowerCase();
    const user = users.find((u) => u.email === normalized);
    if (!user || user.password !== password) {
      log.warn(`login failed: ${normalized}`);
      throw new AuthError("אימייל או סיסמה שגויים");
    }
    log.info(`login ok: user ${user.id}`);
    return { userId: user.id };
  };
}
