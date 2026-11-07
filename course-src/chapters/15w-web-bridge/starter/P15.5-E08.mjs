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

// createApiClient(baseUrl) → { listTasks(params), createTask(body), updateTask(id, changes), deleteTask(id) }
// תשובה שאינה 2xx → ApiError(status, code, message, details)
export function createApiClient(baseUrl) {
  // כתוב כאן
}
