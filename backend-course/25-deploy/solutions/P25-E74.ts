// P25-E74: מאיזו כתובת הגיעה הבקשה?
const first = (v: string) => v.split(",")[0].trim();

export function requestOrigin(h: { host?: string; forwardedHost?: string; forwardedProto?: string; encrypted?: boolean }, trusted: boolean): string {
  let protocol = h.encrypted ? "https" : "http";
  if (trusted && h.forwardedProto) protocol = first(h.forwardedProto);
  const host = trusted && h.forwardedHost ? first(h.forwardedHost) : h.host;
  if (!host) throw new Error("אין Host");
  return `${protocol}://${host}`;
}
