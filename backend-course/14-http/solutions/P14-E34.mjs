// P14-E34: חלקי הנתיב
export function pathSegments(input) {
  const { pathname } = new URL(input, "http://x");
  return pathname
    .split("/")
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));
}

for (const s of ["https://shop.co.il/v2/orders/17?page=2", "/a//b/", "/%D7%A1%D7%9C/7", "/files/a%2Fb", "/"]) {
  console.log(s.padEnd(40), pathSegments(s));
}
