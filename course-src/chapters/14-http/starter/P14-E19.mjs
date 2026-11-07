// P14-E19
// fetchWithRetry(url, init, { retries, delayMs }) → Response
// מנסה שוב רק על 408/429/500/502/503/504 או שגיאת רשת; המתנה: delayMs, 2×, 4×...
export async function fetchWithRetry(url, init = {}, { retries = 2, delayMs = 200 } = {}) {
  // כתוב כאן
}
