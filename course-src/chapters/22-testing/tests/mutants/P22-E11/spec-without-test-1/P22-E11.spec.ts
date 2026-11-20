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


test("אין משימות באיחור — לא שולחים כלום", async () => {
  const mailer = fakeMailer();
  assert.equal(await notifyOverdue(users, new Map(), mailer), 0);
  assert.equal(mailer.send.mock.callCount(), 0);
});

test("רשימה ריקה לא נחשבת", async () => {
  const mailer = fakeMailer();
  assert.equal(await notifyOverdue(users, new Map([[3, []]]), mailer), 0);
});
