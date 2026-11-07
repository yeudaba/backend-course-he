// P15.5-E08
export class ApiError extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function createApiClient(baseUrl) {
  async function request(method, path, body) {
    const res = await fetch(baseUrl + path, {
      method,
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 204) return undefined;
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const e = data?.error;
      throw new ApiError(res.status, e?.code ?? "UNKNOWN", e?.message ?? `HTTP ${res.status}`, e?.details ?? []);
    }
    return data;
  }

  return {
    listTasks(params = {}) {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) if (v !== "" && v !== undefined && v !== null) sp.append(k, String(v));
      const qs = sp.toString();
      return request("GET", `/tasks${qs ? `?${qs}` : ""}`);
    },
    createTask: (body) => request("POST", "/tasks", body),
    updateTask: (id, changes) => request("PATCH", `/tasks/${id}`, changes),
    deleteTask: (id) => request("DELETE", `/tasks/${id}`),
  };
}
