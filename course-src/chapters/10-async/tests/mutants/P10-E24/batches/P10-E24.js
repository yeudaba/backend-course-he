async function mapLimit(items, limit, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += limit) out.push(...(await Promise.all(items.slice(i, i + limit).map((x, k) => fn(x, i + k)))));
  return out;
}
module.exports = { mapLimit };
