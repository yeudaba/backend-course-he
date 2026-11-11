// P15.5-E74: רק התשובה האחרונה
export function latestOnly(fn) {
  let latest = 0;
  return async (...args) => {
    const my = ++latest;
    try {
      const value = await fn(...args);
      return my === latest ? { stale: false, value } : { stale: true };
    } catch (err) {
      if (my !== latest) return { stale: true };
      throw err;
    }
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const load = latestOnly(async (status, ms) => {
  await sleep(ms);
  return `${status}: ${status === "open" ? "חלב" : "לחם"}`;
});
const a = load("open", 100);
const b = load("done", 20);
console.log(await b);
console.log(await a);
