// P23-E72: interpolation בסגנון compose
const RE = /\$\$|\$\{([A-Za-z_]\w*)(?:(:?[-?])([^}]*))?\}|\$([A-Za-z_]\w*)/g;

export function interpolate(text: string, env: Record<string, string | undefined>): string {
  return text.replace(RE, (all, braced?: string, op?: string, arg?: string, bare?: string) => {
    if (all === "$$") return "$";
    const name = (braced ?? bare)!;
    const value = env[name];
    const empty = value === undefined || value === "";
    switch (op) {
      case ":-":
        return empty ? arg! : value!;
      case "-":
        return value === undefined ? arg! : value;
      case ":?":
        if (empty) throw new Error(`${name}: ${arg}`);
        return value!;
      case "?":
        if (value === undefined) throw new Error(`${name}: ${arg}`);
        return value;
      default:
        return value ?? "";
    }
  });
}
