// P14-E23: שלושה באגים
// parseSearch("/products?q=%D7%9E%D7%A1%D7%9A&page=2") → { q: "מסך", page: 2, nextPage: 3 }
export function parseSearch(url) {
  const query = url.split("?")[1];
  const params = {};
  for (const pair of query.split("&")) {
    const [key, value] = pair.split("=");
    params[key] = value;
  }
  const page = params.page ?? 1;
  return { q: params.q ?? "", page, nextPage: page + 1 };
}
