// P14-E64: לפרק שורת פקודה עם מירכאות
export function splitArgs(cmd) {
  const args = [];
  let current = "";
  let started = false;
  let quote = null;
  const finish = () => {
    if (started) args.push(current);
    current = "";
    started = false;
  };
  for (let i = 0; i < cmd.length; i++) {
    const ch = cmd[i];
    if (quote === "'") {
      if (ch === "'") quote = null;
      else current += ch;
    } else if (quote === '"') {
      if (ch === "\\" && (cmd[i + 1] === '"' || cmd[i + 1] === "\\")) current += cmd[++i];
      else if (ch === '"') quote = null;
      else current += ch;
    } else if (ch === "'" || ch === '"') {
      quote = ch;
      started = true;
    } else if (ch === "\\" && cmd[i + 1] === "\n") {
      i++;
      finish();
    } else if (ch === " " || ch === "\n" || ch === "\t") {
      finish();
    } else {
      current += ch;
      started = true;
    }
  }
  if (quote) throw new Error("מירכאה לא נסגרה");
  finish();
  return args;
}

console.log(splitArgs(`curl -X POST 'http://x/a b' -H "Content-Type: application/json" -d '{"a":1}'`));
console.log(splitArgs(`curl 'http://x' \\\n  -H 'Accept: */*' \\\n  -d "say \\"hi\\""`));
console.log(splitArgs(`a  -H"X: 1" '' "it's"`));
try {
  splitArgs(`curl -d '{"name":"O'Brien"}'`);
} catch (err) {
  console.log(err.message);
}
