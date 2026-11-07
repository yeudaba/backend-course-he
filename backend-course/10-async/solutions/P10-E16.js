// P10-E16
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function retryAsync(fn, { attempts = 3, baseDelay = 10, log = () => {} } = {}) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn(i);
    } catch (err) {
      if (i === attempts) {
        throw err;
      }
      log(`attempt ${i} failed: ${err.message}`);
      await sleep(baseDelay * 2 ** (i - 1));
    }
  }
}

retryAsync(async (n) => {
  if (n < 2) throw new Error("busy");
  return "ok";
}, { log: console.log }).then(console.log);

module.exports = { retryAsync };
