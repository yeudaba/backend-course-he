// P13-E14
import { parseArgs } from "node:util";

const KNOWN = ["name", "times", "shout"];

export function run(argv, { log = console.log, error = console.error } = {}) {
  const unknown = argv.find((a) => a.startsWith("--") && !KNOWN.includes(a.slice(2).split("=")[0]));
  if (unknown) {
    error(`דגל לא מוכר: ${unknown.split("=")[0]}`);
    return 2;
  }
  const { values } = parseArgs({
    args: argv,
    options: { name: { type: "string" }, times: { type: "string" }, shout: { type: "boolean" } },
    strict: true,
  });
  if (!values.name) {
    error("חסר --name");
    return 2;
  }
  const times = values.times === undefined ? 1 : Number(values.times);
  if (!Number.isInteger(times) || times < 1 || times > 10) {
    error("--times חייב להיות בין 1 ל־10");
    return 2;
  }
  const text = `שלום, ${values.name}!`;
  for (let i = 0; i < times; i++) {
    log(values.shout ? text.toUpperCase() : text);
  }
  return 0;
}

console.log(run(["--name", "Dana", "--times", "2", "--shout"]));
