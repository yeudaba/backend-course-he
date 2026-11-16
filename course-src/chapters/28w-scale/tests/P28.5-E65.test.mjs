import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { csvLine, toCsv } = await load(import.meta.url, "P28.5-E65.ts");

test("csvLine", () => {
  assert.equal(csvLine(["a", 1, true, null, undefined]), "a,1,true,,\r\n");
  assert.equal(csvLine(["רחוב הרצל 5, תל אביב", 'he said "hi"', "two\nlines", "cr\r"]), '"רחוב הרצל 5, תל אביב","he said ""hi""","two\nlines","cr\r"\r\n');
  assert.equal(csvLine([new Date("2026-03-01T10:00:00Z"), 0, ""]), "2026-03-01T10:00:00.000Z,0,\r\n");
  assert.equal(csvLine(['"']), '""""\r\n');
});
test("toCsv", () => {
  const rows = [{ id: 1, name: "Dana", city: "חיפה" }, { name: "Yossi, Jr.", id: 2 }];
  const out = [...toCsv(["id", "name", "city"], rows)];
  assert.deepEqual(out, ["id,name,city\r\n", "1,Dana,חיפה\r\n", '2,"Yossi, Jr.",\r\n']);
  assert.deepEqual([...toCsv(["x"], [])], ["x\r\n"]);
});
