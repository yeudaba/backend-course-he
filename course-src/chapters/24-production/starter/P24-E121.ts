// P24-E121: שורת הלוג של בקשה — מדליפה טוקנים ו־authorization, ו־500 מסומן warn.
// { level, msg: "request", requestId, method, path, status, ms } — ובלי שום שדה אחר
// level: ‏500+ error · ‏400+ warn · אחרת info | path בלי query | ms לספרה אחת
//
// בדיקה:  npm run check P24-E121
export interface RequestInfo {
  method: string;
  url: string;
  status: number;
  ms: number;
  requestId: string;
  headers: Record<string, string>;
}

export function toLogEntry(info: RequestInfo) {
  const level = info.status > 500 ? "error" : info.status > 400 ? "warn" : "info";
  return {
    ...info,
    level,
    msg: "request",
    path: info.url,
    ms: Math.round(info.ms * 10) / 10,
  };
}
