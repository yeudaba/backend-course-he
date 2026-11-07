// P07-E12
// toQueryString({ page: 2, sort: "price", q: null }) → "page=2&sort=price"
function toQueryString(params) {
  // כתוב כאן
}

// parseQueryString("?page=2&sort=price") → { page: "2", sort: "price" } | "" → {}
function parseQueryString(text) {
  // כתוב כאן
}

module.exports = { toQueryString, parseQueryString };
