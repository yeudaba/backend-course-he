// P14-E17
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

// readJsonBody(req, { limit }) → האובייקט
// 415 Content-Type | 413 גדול מדי | 400 גוף ריק | 400 JSON לא תקין
export async function readJsonBody(req, { limit = 1_000_000 } = {}) {
  // כתוב כאן
}
