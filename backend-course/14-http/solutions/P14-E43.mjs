// P14-E43: קישורי עמודים
function positiveInt(text, fallback) {
  const n = Number(text);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

export function pageLinks(url, total) {
  const params = new URL(url).searchParams;
  const page = positiveInt(params.get("page"), 1);
  const limit = Math.min(positiveInt(params.get("limit"), 10), 100);
  const pages = Math.max(1, Math.ceil(total / limit));
  const link = (p) => {
    const u = new URL(url);
    u.searchParams.set("page", String(p));
    return u.href;
  };
  return {
    page,
    limit,
    pages,
    prev: page > 1 ? link(page - 1) : null,
    next: page < pages ? link(page + 1) : null,
  };
}

console.log(pageLinks("http://shop.test/products?q=mouse&page=2&limit=5", 12));
console.log(pageLinks("http://shop.test/products", 0));
console.log(pageLinks("http://shop.test/products?page=-3&limit=abc", 25));
