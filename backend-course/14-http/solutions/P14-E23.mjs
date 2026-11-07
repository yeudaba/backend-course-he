// P14-E23: מתוקן
export function parseSearch(url) {
  const params = new URL(url, "http://x").searchParams;
  const page = Number(params.get("page") ?? 1);
  return { q: params.get("q") ?? "", page, nextPage: page + 1 };
}

console.log(parseSearch("/products"), parseSearch("/products?q=%D7%9E%D7%A1%D7%9A&page=2"), parseSearch("/products?q=red+shoes"));
