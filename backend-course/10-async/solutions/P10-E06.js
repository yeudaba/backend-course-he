// P10-E06
function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function countdown(from, ms, log = console.log) {
  for (let n = from; n >= 1; n--) {
    log(n);
    await delay(ms);
  }
  log("🚀");
}

countdown(3, 10);

module.exports = { delay, countdown };
