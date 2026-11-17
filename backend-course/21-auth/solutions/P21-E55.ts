// P21-E55: לקוח API שמוסיף Authorization לכל בקשה
export class ApiError extends Error {
  status: number;
  code: string | undefined;
  constructor(status: number, message: string, code: string | undefined) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function createApiClient(baseUrl: string, getToken: () => string | null) {
  return {
    async request(method: string, path: string, body?: unknown): Promise<unknown> {
      const headers: Record<string, string> = {};
      const token = getToken();
      if (token !== null) headers.authorization = `Bearer ${token}`;
      if (body !== undefined) headers["content-type"] = "application/json";
      const res = await fetch(baseUrl + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
      if (res.status === 204) return null;
      const text = await res.text();
      if (res.ok) return JSON.parse(text);
      let data: { code?: string; message?: string } = {};
      try {
        data = JSON.parse(text);
      } catch {}
      throw new ApiError(res.status, data.message ?? `HTTP ${res.status}`, data.code);
    },
  };
}
