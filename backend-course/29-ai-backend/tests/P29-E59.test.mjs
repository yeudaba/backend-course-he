import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { renderAnswer } = await load(import.meta.url, "P29-E59.ts");

test("escape קודם", () => {
  assert.equal(renderAnswer('<img src=x onerror="alert(1)"> & \'x\''), "<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;x&#39;</p>");
  assert.equal(renderAnswer("**<b>**"), "<p><strong>&lt;b&gt;</strong></p>");
});
test("פסקאות, שורות ומודגש", () => {
  assert.equal(renderAnswer("שלום **דנה**,\nההזמנה נשלחה.\n\n\n  תודה!  \n\n"), "<p>שלום <strong>דנה</strong>,<br>ההזמנה נשלחה.</p><p>תודה!</p>");
  assert.equal(renderAnswer("**לא\nמודגש**"), "<p>**לא<br>מודגש**</p>");
  assert.equal(renderAnswer(""), "");
});
