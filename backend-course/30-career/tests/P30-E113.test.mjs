import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { followUpDraft } = await load(import.meta.url, "P30-E113.ts");

test("טיוטה", () => {
  assert.equal(
    followUpDraft({ company: "Acme", role: "Junior Backend Engineer", appliedOn: "2026-11-03", contact: "Dana" }, "2026-11-12"),
    "Hi Dana,\nI applied for the Junior Backend Engineer role at Acme on 3 Nov 2026 and wanted to follow up — I'm still very interested.\nThanks!",
  );
  assert.equal(followUpDraft({ company: "Brew", role: "Backend Developer", appliedOn: "2026-10-25" }, "2026-11-01"), "Hi there,\nI applied for the Backend Developer role at Brew on 25 Oct 2026 and wanted to follow up — I'm still very interested.\nThanks!", "בדיוק 7 ימים");
});
test("מוקדם מדי", () => {
  assert.equal(followUpDraft({ company: "A", role: "B", appliedOn: "2026-11-03" }, "2026-11-09"), null);
  assert.equal(followUpDraft({ company: "A", role: "B", appliedOn: "2026-11-03" }, "2026-11-03"), null);
});
