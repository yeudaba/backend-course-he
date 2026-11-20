// P24-E121: שורת הלוג של בקשה — מתוקן
export interface RequestInfo {
  method: string;
  url: string;
  status: number;
  ms: number;
  requestId: string;
  headers: Record<string, string>;
}

export function toLogEntry(info: RequestInfo) {
  const level = info.status >= 500 ? "error" : info.status >= 400 ? "warn" : "info";
  return {
    level,
    msg: "request",
    requestId: info.requestId,
    method: info.method,
    path: info.url.split("?")[0],
    status: info.status,
    ms: Math.round(info.ms * 10) / 10,
  };
}
