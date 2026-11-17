// P13-E49: CLI שמסכם מספרים
export function runSum(args, { log, error }) {
  if (args.length === 0) {
    error("שימוש: sum <מספרים...>");
    return 2;
  }
  let sum = 0;
  for (const arg of args) {
    const n = Number(arg);
    if (arg.trim() === "" || Number.isNaN(n)) {
      error(`"${arg}" אינו מספר`);
      return 1;
    }
    sum += n;
  }
  log(sum);
  return 0;
}

if (import.meta.main) {
  process.exitCode = runSum(process.argv.slice(2), { log: console.log, error: console.error });
}

console.log(runSum(["1", "2", "3.5"], { log: console.log, error: console.error }));
console.log(runSum(["1", "abc"], { log: console.log, error: console.log }));
