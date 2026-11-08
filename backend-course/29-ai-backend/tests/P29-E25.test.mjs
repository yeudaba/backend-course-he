import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { retrieve, answerFromDocs } = await load(import.meta.url, "P29-E25.ts");
const docs = [
  { id: "ship", title: "משלוחים", text: "משלוח עד הבית תוך 3 ימי עסקים. משלוח חינם מעל 300 שקלים." },
  { id: "returns", title: "החזרות", text: "אפשר להחזיר מוצר תוך 14 יום מקבלת המשלוח, באריזה המקורית." },
  { id: "warranty", title: "אחריות", text: "אחריות של שנה על מטחנות חשמליות וקומקומים." },
  { id: "about", title: "אודות", text: "חנות ציוד קפה משנת 2019." },
];
const ans = (o) => message(JSON.stringify(o));

test("retrieve — לפי מילים משותפות, הכי רלוונטי ראשון", () => {
  assert.deepEqual(retrieve("כמה זמן אחריות על מטחנות?", docs).map((d) => d.id), ["warranty"]);
  assert.deepEqual(retrieve("משלוח והחזרת מוצר", docs).map((d) => d.id), ["returns", "ship"]);
  assert.deepEqual(retrieve("מה מזג האוויר?", docs), []);
});
test("אין מסמכים ← 'לא מצאתי' בלי לקרוא למודל", async () => {
  const { client, bodies } = fakeClaude(() => assert.fail("לא אמורים לקרוא"));
  const r = await answerFromDocs(client, "מה מזג האוויר?", docs);
  assert.equal(r.called, false);
  assert.deepEqual(r.sources, []);
  assert.equal(bodies().length, 0);
});
test("תשובה עם מקורות; רק מסמכים שנשלפו נשלחים, בתגיות", async () => {
  const { client, bodies } = fakeClaude(() => ans({ answer: "שנה אחריות.", cited_ids: ["warranty"], answerable: true }));
  assert.deepEqual(await answerFromDocs(client, "כמה זמן אחריות על מטחנות?", docs), { answer: "שנה אחריות.", sources: ["warranty"], called: true });
  const content = userText(bodies()[0].messages[0]);
  assert.match(content, /<doc id="warranty"/);
  assert.ok(!content.includes("2019"), "מסמכים לא רלוונטיים לא נשלחים");
  assert.equal(bodies()[0].output_config?.format?.type, "json_schema");
});
test("מקור שלא נשלף — מסונן; בלי מקור אמיתי או answerable=false ← 'לא מצאתי'", async () => {
  const one = fakeClaude(() => ans({ answer: "שנה.", cited_ids: ["warranty", "secret-doc"], answerable: true }));
  assert.deepEqual((await answerFromDocs(one.client, "אחריות על מטחנות", docs)).sources, ["warranty"]);
  const fake = fakeClaude(() => ans({ answer: "שנתיים!", cited_ids: ["made-up"], answerable: true }));
  assert.deepEqual((await answerFromDocs(fake.client, "אחריות על מטחנות", docs)).sources, []);
  const no = fakeClaude(() => ans({ answer: "", cited_ids: [], answerable: false }));
  assert.match((await answerFromDocs(no.client, "אחריות על מטחנות", docs)).answer, /לא מצאתי/);
});
