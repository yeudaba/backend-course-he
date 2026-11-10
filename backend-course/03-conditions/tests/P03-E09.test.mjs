import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E09.js";
const str = (name, v) => [new RegExp(`(${name}\\s*=\\s*)(["'\`]).*?\\2`), `$1"${v}"`, `את const ${name} = ...`];
const bool = (name, v) => [new RegExp(`(${name}\\s*=\\s*)(true|false)`), `$1${v}`, `את const ${name} = ...`];
const login = (...changes) => run(import.meta.url, FILE, { changes });

test("שם משתמש עם רווחים ואותיות גדולות — כניסה הצליחה", () => sameOutput(login(), ["כניסה הצליחה"]));
test("שם משתמש באותיות גדולות בלבד — כניסה הצליחה", () => sameOutput(login(str("typedUsername", "DANA")), ["כניסה הצליחה"]));
test("סיסמה באות גדולה במקום קטנה — שגויה (סיסמה רגישה לאותיות)", () => sameOutput(login(str("typedPassword", "S3cret!Pass")), ["שם משתמש או סיסמה שגויים"]));
test("שם משתמש אחר — שגוי", () => sameOutput(login(str("typedUsername", "yossi")), ["שם משתמש או סיסמה שגויים"]));
test("חשבון חסום — גם עם פרטים נכונים", () => sameOutput(login(bool("isBlocked", true)), ["החשבון חסום"]));
test("חשבון חסום וסיסמה שגויה — עדיין 'החשבון חסום'", () => sameOutput(login(bool("isBlocked", true), str("typedPassword", "x")), ["החשבון חסום"]));
