import { test } from "node:test";
import assert from "node:assert/strict";
import { runScript } from "../../tools/shell.mjs";
import { fakeDocker } from "./_fakedocker.mjs";

function runCall(t) {
  const d = fakeDocker(t, []);
  const r = runScript(import.meta.url, "P23-E102.sh", [], { env: d.env });
  assert.equal(r.status, 0, r.stderr);
  const run = d.calls().find((c) => c[0] === "run");
  assert.ok(run, "הסקריפט צריך להריץ docker run");
  return run;
}
const flag = (args, name) => {
  const out = [];
  args.forEach((a, i) => {
    if (a === name) out.push(args[i + 1]);
    else if (a.startsWith(name + "=")) out.push(a.slice(name.length + 1));
  });
  return out;
};

test("ברקע, בשם dev-db, מה־image הנכון", (t) => {
  const a = runCall(t);
  assert.ok(a.includes("-d") || a.includes("--detach"), "בלי -d הקונטיינר רץ בחזית, וה־Terminal נתקע");
  assert.deepEqual(flag(a, "--name"), ["dev-db"]);
  assert.equal(a.at(-1), "postgres:18-alpine", "ה־image בסוף");
});
test("POSTGRES_PASSWORD=dev", (t) => {
  const a = runCall(t);
  assert.ok([...flag(a, "-e"), ...flag(a, "--env")].includes("POSTGRES_PASSWORD=dev"), "בלי POSTGRES_PASSWORD ה־image לא מאתחל מסד, והקונטיינר יוצא");
});
test("פורט קבוע, רק מהמחשב", (t) => {
  const a = runCall(t);
  assert.deepEqual([...flag(a, "-p"), ...flag(a, "--publish")], ["127.0.0.1:55432:5432"], "-p 5432 בוחר פורט אקראי; צריך 127.0.0.1:55432:5432");
});
test("volume עם שם", (t) => {
  const a = runCall(t);
  assert.deepEqual([...flag(a, "-v"), ...flag(a, "--volume")], ["dev-db-data:/var/lib/postgresql"], "volume בלי שם (אנונימי) חדש בכל run — הנתונים לא נשמרים");
});
