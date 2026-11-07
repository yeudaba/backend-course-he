// P10-E19
async function fastestSuccess(fns) {
  try {
    return await Promise.any(fns.map((fn) => fn()));
  } catch {
    throw new Error("כל המקורות נכשלו");
  }
}

const after = (ms, v, fail = false) => () =>
  new Promise((res, rej) => setTimeout(() => (fail ? rej(new Error(v)) : res(v)), ms));
fastestSuccess([after(5, "x", true), after(20, "slow"), after(10, "fast")]).then(console.log);

module.exports = { fastestSuccess };
