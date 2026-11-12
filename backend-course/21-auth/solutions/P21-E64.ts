// P21-E64: refresh token ב־cookie
const ATTRS = ["Path=/auth", "HttpOnly", "Secure", "SameSite=Strict"];

export function refreshCookie(token: string, maxAgeSec: number): string {
  return [`refresh_token=${token}`, `Max-Age=${maxAgeSec}`, ...ATTRS].join("; ");
}

export function clearRefreshCookie(): string {
  return refreshCookie("", 0);
}

export function readRefreshCookie(cookieHeader: string | undefined): string | null {
  for (const part of (cookieHeader ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    if (part.slice(0, i).trim() === "refresh_token") return part.slice(i + 1).trim() || null;
  }
  return null;
}
