// P27-E92: בוחר קוד סטטוס
type S = { authenticated: boolean; exists: boolean; owned: boolean; allowed: boolean; valid: boolean; conflict: boolean; rateLimited: boolean; created?: boolean };

export function chooseStatus(s: S): number {
  if (s.rateLimited) return 429; // לא מבזבזים עבודה (גם לא בדיקת טוקן) על מי שחרג
  if (!s.authenticated) return 401;
  if (!s.exists || !s.owned) return 404; // לא מגלים שקיים משאב של מישהו אחר
  if (!s.allowed) return 403;
  if (!s.valid) return 422;
  if (s.conflict) return 409;
  return s.created ? 201 : 200;
}
