// P22-E11 — הבדיקות
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { notifyOverdue, type Mailer } from "./P22-E11.ts";

// fake שמקליט — במקום שרת מיילים אמיתי
function fakeMailer() {
  const send = mock.fn<Mailer["send"]>(async () => {});
  return { send };
}

const users = [
  { id: 1, email: "dana@example.com", wantsEmails: true },
  { id: 2, email: "yossi@example.com", wantsEmails: false },
  { id: 3, email: "rona@example.com", wantsEmails: true },
];

test("שולח רק למי שרוצה ויש לו משימות באיחור", async () => {
  const mailer = fakeMailer();
  const overdue = new Map([
    [1, ["לשלם חשבון", "להתקשר לבנק"]],
    [2, ["משהו"]],
  ]);
  const sent = await notifyOverdue(users, overdue, mailer);
  assert.equal(sent, 1);
  assert.equal(mailer.send.mock.callCount(), 1);
  assert.deepEqual(mailer.send.mock.calls[0].arguments, ["dana@example.com", "יש לך 2 משימות באיחור", "לשלם חשבון\nלהתקשר לבנק"]);
});

test("אין משימות באיחור — לא שולחים כלום", async () => {
  const mailer = fakeMailer();
  assert.equal(await notifyOverdue(users, new Map(), mailer), 0);
  assert.equal(mailer.send.mock.callCount(), 0);
});

test("רשימה ריקה לא נחשבת", async () => {
  const mailer = fakeMailer();
  assert.equal(await notifyOverdue(users, new Map([[3, []]]), mailer), 0);
});
