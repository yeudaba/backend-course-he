import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E10.js";
const order = (total, member) =>
  run(import.meta.url, FILE, {
    changes: [
      [/(total\s*=\s*)\d+(\.\d+)?/, `$1${total}`, "את const total = ..."],
      [/(isClubMember\s*=\s*)(true|false)/, `$1${member}`, "את const isClubMember = ..."],
    ],
  });

test("250, לא חבר — משלוח חינם", () => sameOutput(order(250, false), ["משלוח: 0.00 | לתשלום: 250.00"]));
test("200 בדיוק, לא חבר — משלוח חינם", () => sameOutput(order(200, false), ["משלוח: 0.00 | לתשלום: 200.00"]));
test("150, לא חבר — משלמים משלוח", () => sameOutput(order(150, false), ["משלוח: 29.90 | לתשלום: 179.90"]));
test("150, חבר מועדון — משלוח חינם", () => sameOutput(order(150, true), ["משלוח: 0.00 | לתשלום: 150.00"]));
