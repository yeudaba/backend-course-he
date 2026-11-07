// P07-E12: אובייקט ⇄ query string
function toQueryString(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function parseQueryString(text) {
  const clean = text.startsWith("?") ? text.slice(1) : text;
  const result = {};
  if (clean === "") {
    return result;
  }
  for (const pair of clean.split("&")) {
    const [key, value = ""] = pair.split("=");
    result[key] = value;
  }
  return result;
}

console.log(toQueryString({ page: 2, sort: "price", q: null }));
console.log(parseQueryString("?page=2&sort=price"));

module.exports = { toQueryString, parseQueryString };
