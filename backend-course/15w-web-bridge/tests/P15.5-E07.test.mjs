import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { formToTask } = await load(import.meta.url, "P15.5-E07.mjs");

test("ערכים ריקים", () => assert.deepEqual(formToTask({ title: "  ללמוד ", priority: "", dueDate: "" }), { title: "ללמוד", priority: "medium", dueDate: null }));
test("שדות חסרים ושדות זרים", () => assert.deepEqual(formToTask({ title: "א", submit: "שלח" }), { title: "א", priority: "medium", dueDate: null }));
test("מלא", () => assert.deepEqual(formToTask({ title: "א", priority: "high", dueDate: "2026-12-01", description: " פירוט " }), { title: "א", priority: "high", dueDate: "2026-12-01", description: "פירוט" }));
test("description ריק", () => assert.deepEqual(formToTask({ title: "א", description: "   " }), { title: "א", priority: "medium", dueDate: null, description: null }));
