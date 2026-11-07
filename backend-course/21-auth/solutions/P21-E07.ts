// P21-E07
export const COMMON_PASSWORDS = ["password", "12345678", "123456789", "qwerty123", "iloveyou", "11111111", "password1", "abcd1234"];

export function validatePassword(password: string, email: string): string[] {
  const problems: string[] = [];
  if ([...password].length < 8) problems.push("לפחות 8 תווים");
  if (Buffer.byteLength(password, "utf8") > 72) problems.push("עד 72 בתים");
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) problems.push("סיסמה נפוצה מדי");
  const local = email.split("@")[0].toLowerCase();
  if (local.length >= 3 && password.toLowerCase().includes(local)) problems.push("הסיסמה לא יכולה להכיל את האימייל");
  return problems;
}
