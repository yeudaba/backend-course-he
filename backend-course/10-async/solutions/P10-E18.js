// P10-E18
async function processInOrder(items, fn) {
  const results = [];
  for (const item of items) {
    results.push(await fn(item));
  }
  return results;
}

const log = [];
processInOrder([1, 2, 3], async (n) => {
  log.push(`start ${n}`);
  await new Promise((r) => setTimeout(r, 10 - n * 3));
  log.push(`end ${n}`);
  return n * 10;
}).then((r) => console.log(r, log.join(", ")));

module.exports = { processInOrder };
