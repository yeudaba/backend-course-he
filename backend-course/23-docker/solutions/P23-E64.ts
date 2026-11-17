// P23-E64: האם קובץ נכנס ל־build context
function toRegExp(pattern: string): RegExp {
  let re = "";
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "*" && pattern[i + 1] === "*") {
      if (pattern[i + 2] === "/") {
        re += "(?:.*/)?";
        i += 2;
      } else {
        re += ".*";
        i += 1;
      }
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}(?:/.*)?$`);
}

export function isIgnored(file: string, patterns: string[]): boolean {
  let ignored = false;
  for (const raw of patterns) {
    let p = raw.trim();
    if (!p || p.startsWith("#")) continue;
    const negate = p.startsWith("!");
    if (negate) p = p.slice(1);
    p = p.replace(/^\/+|\/+$/g, "");
    if (toRegExp(p).test(file)) ignored = !negate;
  }
  return ignored;
}
