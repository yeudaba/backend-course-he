function toCamel(key) {
  return key
    .split("_")
    .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join("");
}

function camelizeKeys(row) {
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    result[toCamel(key)] = value;
  }
  return result;
}

function camelizeRows(rows) {
  return rows.map(camelizeKeys);
}

console.log(camelizeKeys({ id: 7, first_name: "דנה", last_login_at: null }));

module.exports = { toCamel, camelizeKeys, camelizeRows };
