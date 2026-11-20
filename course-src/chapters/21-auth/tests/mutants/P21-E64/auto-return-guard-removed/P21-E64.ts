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

  }
  return null;
}
