// P14-E16
const segments = (p) => p.split("/").filter(Boolean);

function matchParts(pattern, parts) {
  if (pattern.length !== parts.length) return null;
  const params = {};
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i].startsWith(":")) params[pattern[i].slice(1)] = decodeURIComponent(parts[i]);
    else if (pattern[i] !== parts[i]) return null;
  }
  return params;
}

export function createRouter() {
  const routes = [];
  return {
    add(method, pattern, handler) {
      routes.push({ method, pattern: segments(pattern), handler });
    },
    match(method, path) {
      const parts = segments(path);
      const allow = [];
      for (const route of routes) {
        const params = matchParts(route.pattern, parts);
        if (!params) continue;
        if (route.method === method) return { status: 200, handler: route.handler, params };
        allow.push(route.method);
      }
      return allow.length > 0 ? { status: 405, allow } : { status: 404 };
    },
  };
}

const router = createRouter();
router.add("GET", "/products/:id", "getOne");
router.add("DELETE", "/products/:id", "remove");
const m = router.match("GET", "/products/7");
console.log(m.status, m.handler, m.params);
console.log(router.match("PUT", "/products/7"), router.match("GET", "/nope"));
