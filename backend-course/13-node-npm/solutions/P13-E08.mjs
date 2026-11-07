// P13-E08
export function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const body = arg.slice(2);
    const eq = body.indexOf("=");
    if (eq !== -1) {
      flags[body.slice(0, eq)] = body.slice(eq + 1);
    } else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
      flags[body] = argv[i + 1];
      i++;
    } else {
      flags[body] = true;
    }
  }
  return { positional, flags };
}

console.log(parseArgs(["add", "--amount", "5", "--note=hi there", "--dry", "--x"]));
