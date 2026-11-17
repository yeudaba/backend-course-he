// P14-E63: מפקודת curl לבקשה
export function parseCurlArgs(args) {
  let method;
  let url;
  let body;
  const headers = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "-X":
      case "--request":
        method = args[++i].toUpperCase();
        break;
      case "-H":
      case "--header": {
        const h = args[++i];
        const colon = h.indexOf(":");
        headers[h.slice(0, colon).trim()] = h.slice(colon + 1).trim();
        break;
      }
      case "-d":
      case "--data":
        body = args[++i];
        break;
      case "-i":
      case "-v":
      case "-s":
        break;
      default:
        if (arg.startsWith("-")) throw new Error(`דגל לא מוכר: ${arg}`);
        url = arg;
    }
  }
  if (url === undefined) throw new Error("חסרה כתובת");
  return { method: method ?? (body === undefined ? "GET" : "POST"), url, headers, body };
}

console.log(parseCurlArgs(["-i", "-d", '{"a":1}', "-H", "Content-Type: application/json", "http://localhost:4000/products"]));
console.log(parseCurlArgs(["--request", "delete", "localhost:4000/products/3", "-s"]));
for (const bad of [["-L", "http://x"], ["-i"]]) {
  try {
    parseCurlArgs(bad);
  } catch (err) {
    console.log(err.message);
  }
}
