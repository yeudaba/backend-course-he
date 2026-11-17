import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const mod = () => exportsOf(import.meta.url, "P15.5-E44.mjs", ["specificity", "winner"]);
test("specificity", async () => {
  const { specificity } = await mod();
  const cases = [
    ["#main .card h2:hover", [1, 2, 1]],
    ["ul li.done", [0, 1, 2]],
    [".card .title", [0, 2, 0]],
    ["h2", [0, 0, 1]],
    ["*", [0, 0, 0]],
    ["input[type=email]", [0, 1, 1]],
    ["#a #b", [2, 0, 0]],
    ["  nav   a:hover  ", [0, 1, 2]],
    [".a.b.c", [0, 3, 0]],
    ["button.danger:disabled", [0, 2, 1]],
    ["[hidden]", [0, 1, 0]],
  ];
  for (const [s, want] of cases) assert.deepEqual(specificity(s), want, `specificity("${s}")`);
});
test("winner", async () => {
  const { winner } = await mod();
  assert.equal(winner(null, [{ selector: "h2", value: "black" }, { selector: ".title", value: "blue" }]), "blue");
  assert.equal(winner(null, [{ selector: "#main-title", value: "red" }, { selector: ".card .title", value: "green" }]), "red");
  assert.equal(winner(null, [{ selector: ".title", value: "blue" }, { selector: ".big", value: "purple" }]), "purple", "שוויון — האחרון");
  assert.equal(winner(null, [{ selector: ".card h2", value: "orange" }, { selector: ".title", value: "blue" }]), "orange");
  assert.equal(winner(null, [{ selector: "h2.title", value: "teal" }, { selector: ".card .big", value: "brown" }]), "brown");
  assert.equal(winner(null, [{ selector: "#x", value: "id" }, { selector: ".a.b.c.d.e.f.g.h.i.j.k", value: "classes" }]), "id", "11 classes לא מנצחים id");
  assert.equal(winner(null, [{ selector: "a b c d e f g h i j k", value: "tags" }, { selector: ".x", value: "class" }]), "class");
  assert.equal(winner(null, []), undefined);
});
