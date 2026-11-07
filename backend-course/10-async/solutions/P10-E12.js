// P10-E12
function fetchAll(ids, fetchOne) {
  return Promise.all(ids.map((id) => fetchOne(id)));
}

const fake = (id) => new Promise((r) => setTimeout(() => r(`user-${id}`), 20));
fetchAll([3, 1, 2], fake).then(console.log);

module.exports = { fetchAll };
