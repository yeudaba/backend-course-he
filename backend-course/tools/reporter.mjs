// מדווח פשוט וקריא לבודק של הקורס: ✔ / ✖ ומה קיבלנו מול מה ציפינו.
import { inspect } from "node:util";

const show = (v) => inspect(v, { depth: 3, breakLength: Infinity });

export default async function* reporter(source) {
  let pass = 0;
  let fail = 0;
  for await (const event of source) {
    if (event.type === "test:pass" && event.data.details?.type !== "suite") {
      pass++;
      yield `  ✔ ${event.data.name}\n`;
    } else if (event.type === "test:fail" && event.data.details?.type !== "suite") {
      fail++;
      const err = event.data.details?.error;
      const cause = err?.cause ?? err;
      yield `  ✖ ${event.data.name}\n`;
      // הודעה שכתבנו בבדיקה (assert.ok(x, "...")) — מסבירה מה חסר טוב יותר מ־"קיבלנו false"
      const custom = cause && typeof cause === "object" && cause.generatedMessage === false && cause.message;
      if (custom) yield `      ${String(custom).split("\n")[0]}\n`;
      if (custom && ["==", "fail", "match", "doesNotMatch"].includes(cause.operator)) {
        // assert.ok / fail / match — ההודעה מספיקה (בלי להדפיס את כל הקוד שלך כ"קיבלנו")
      } else if (cause && typeof cause === "object" && "expected" in cause && "actual" in cause) {
        yield `      קיבלנו: ${show(cause.actual)}\n      ציפינו: ${show(cause.expected)}\n`;
      } else if (cause && typeof cause === "object" && cause.message) {
        yield `      שגיאה: ${String(cause.message).split("\n")[0]}\n`;
      } else {
        yield `      הקובץ שלך לא נטען — ראה את השגיאה למעלה\n`;
      }
    } else if (event.type === "test:stderr") {
      const line = String(event.data.message).trim();
      if (/^\w*Error\b/.test(line)) yield `      ⚠️ ${line}\n`;
    } else if (event.type === "test:stdout") {
      yield `      (פלט מהקוד שלך) ${event.data.message}`;
    }
  }
  yield `\n${pass} עברו, ${fail} נכשלו\n`;
}
