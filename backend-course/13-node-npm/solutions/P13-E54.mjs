// P13-E54: הגדרות מדגלים וממשתני סביבה
export function resolveSettings(args, env) {
  let portText;
  let verbose = env.VERBOSE === "1";
  let name;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--port") {
      portText = args[i + 1];
      i++;
    } else if (a.startsWith("--port=")) {
      portText = a.slice("--port=".length);
    } else if (a === "--verbose") {
      verbose = true;
    } else if (a.startsWith("--")) {
      throw new Error(`דגל לא מוכר: ${a}`);
    } else if (name === undefined) {
      name = a;
    }
  }
  const text = portText ?? env.PORT ?? "3000";
  const port = Number(text);
  if (!/^\d+$/.test(text) || port < 1 || port > 65535) throw new Error(`port לא תקין: ${text}`);
  return { port, verbose, name: name ?? "app" };
}

console.log(resolveSettings(["shop", "--port", "9000"], { PORT: "8080" }));
console.log(resolveSettings(["--port=7000", "--verbose"], {}));
console.log(resolveSettings([], { PORT: "8080", VERBOSE: "1" }));
try {
  resolveSettings(["--prot", "1"], {});
} catch (err) {
  console.log(err.message);
}
