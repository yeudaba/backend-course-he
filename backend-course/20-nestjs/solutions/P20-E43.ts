// P20-E43: decorators משלך — @Route ו־routesOf
type RouteInfo = { method: string; path: string; handler: string };

const prefixes = new Map<Function, string>();
const routes = new Map<Function, RouteInfo[]>();

export function Prefix(path: string): ClassDecorator {
  return (target) => {
    prefixes.set(target, path);
  };
}

export function Route(method: "GET" | "POST" | "DELETE", path = ""): MethodDecorator {
  return (target, propertyKey) => {
    const cls = target.constructor;
    if (!routes.has(cls)) routes.set(cls, []);
    routes.get(cls)!.push({ method, path, handler: String(propertyKey) });
  };
}

export function routesOf(cls: Function): string[] {
  const prefix = prefixes.get(cls) ?? "";
  return (routes.get(cls) ?? []).map((r) => {
    const full = "/" + [prefix, r.path].filter((p) => p !== "").join("/");
    return `${r.method} ${full} -> ${r.handler}`;
  });
}
