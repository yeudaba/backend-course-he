function delay(ms, value) {
  return Promise.resolve(value);
}
async function countdown(from, ms, log = console.log) {
  for (let n = from; n >= 1; n--) {
    log(n);
    await new Promise((r) => setTimeout(r, ms));
  }
  log("🚀");
}
module.exports = { delay, countdown };
