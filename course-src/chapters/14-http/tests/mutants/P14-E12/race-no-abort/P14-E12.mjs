// P14-E12
export async function getJson(url, { timeoutMs = 3000 } = {}) {
  const res = await Promise.race([fetch(url), new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error("timeout"), { name: "TimeoutError" })), timeoutMs))]);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
