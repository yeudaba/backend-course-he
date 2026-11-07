// P10-E15
function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`timeout after ${ms}ms`);
      err.code = "TIMEOUT";
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const slow = new Promise((r) => setTimeout(() => r("done"), 200));
withTimeout(slow, 20).catch((e) => console.log(e.code, e.message));

module.exports = { withTimeout };
