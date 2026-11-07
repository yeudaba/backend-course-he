// P10-E25: cache עם שיתוף בקשות בטיסה
function memoizeAsync(fn, ttlMs) {
  const cache = new Map();
  return function (key) {
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) {
      return hit.promise;
    }
    const promise = fn(key);
    cache.set(key, { promise, expires: Date.now() + ttlMs });
    promise.catch(() => cache.delete(key));
    return promise;
  };
}

let calls = 0;
const slowDouble = async (n) => {
  calls++;
  await new Promise((r) => setTimeout(r, 10));
  return n * 2;
};
const cached = memoizeAsync(slowDouble, 1000);
Promise.all([cached(5), cached(5), cached(5)]).then((r) => console.log(r, "calls:", calls));

module.exports = { memoizeAsync };
