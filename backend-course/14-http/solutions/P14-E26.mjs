// P14-E26: פירוק header של Cookie
export function parseCookies(header) {
  const cookies = {};
  if (!header) {
    return cookies;
  }
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i === -1) {
      continue;
    }
    const name = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    if (name) {
      cookies[name] = decodeURIComponent(value);
    }
  }
  return cookies;
}

console.log(parseCookies("theme=dark; lang=he; cart=%D7%A1%D7%9C"));
console.log(parseCookies("token=a=b=c;  broken ; =x"));
console.log(parseCookies(undefined));
