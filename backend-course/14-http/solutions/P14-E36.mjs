// P14-E36: לשנות פרמטרים בכתובת
export function withQuery(url, changes) {
  const u = new URL(url);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === undefined) u.searchParams.delete(key);
    else u.searchParams.set(key, String(value));
  }
  return u.href;
}

console.log(withQuery("http://shop.test/p?page=1&sort=price", { page: 2 }));
console.log(withQuery("http://shop.test/p?page=1", { page: null, q: "red shoes" }));
console.log(withQuery("http://shop.test/p?page=1", { page: undefined }));
console.log(withQuery("http://shop.test/p", { inStock: false, min: 0, q: "מסך" }));
