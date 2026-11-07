import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { mergeSettings } = await load(import.meta.url, "P07-E16.js");

const make = () => ({ theme: "light", language: "he", notifications: { email: true, sms: false } });
test("מיזוג כולל רמה פנימית", () => assert.deepEqual(mergeSettings(make(), { theme: "dark", notifications: { sms: true } }), { theme: "dark", language: "he", notifications: { email: true, sms: true } }));
test("undefined לא דורס", () => assert.deepEqual(mergeSettings(make(), { language: undefined }), make()));
test("בלי הגדרות משתמש", () => assert.deepEqual(mergeSettings(make(), {}), make()));
test("הקלטים לא משתנים", () => { const d = make(); const u = { notifications: { sms: true } }; mergeSettings(d, u); assert.deepEqual(d, make()); assert.deepEqual(u, { notifications: { sms: true } }); });
