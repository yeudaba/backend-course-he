// P24-E07: redact — עותק של הערך, בלי סודות
export function redact(value: unknown, keys: string[] = ["password", "passwordHash", "token", "accessToken", "refreshToken", "authorization", "cookie", "secret"]): unknown {
  return value; // כתוב כאן
}
