async function fetchAll(ids, fetchOne) {
  const results = [];
  for (const id of ids) results.push(await fetchOne(id));
  return results;
}
module.exports = { fetchAll };
