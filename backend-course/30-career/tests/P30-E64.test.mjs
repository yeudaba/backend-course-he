import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseCv } = await load(import.meta.url, "P30-E64.ts");
const CV = `# Noa Cohen
Junior Backend Developer · Tel Aviv
noa.cohen+jobs@mail.co.il · https://github.com/noacohen-dev/ · https://www.linkedin.com/in/noa-cohen-dev

## Summary
Backend developer (Node.js, TypeScript).

## Projects
### Coffee Shop API — https://coffee.example.dev
- Built a NestJS + PostgreSQL store API
* Prevented overselling, tested with 20 concurrent orders
   - not a top-level bullet
### Tasks API
- 8 stages, CI from day one

## Education
- Backend Development Program
`;

test("פירוק מלא", () => {
  assert.deepEqual(parseCv(CV), {
    name: "Noa Cohen",
    title: "Junior Backend Developer · Tel Aviv",
    contacts: { email: "noa.cohen+jobs@mail.co.il", github: "github.com/noacohen-dev", linkedin: "linkedin.com/in/noa-cohen-dev" },
    sections: {
      Summary: [],
      Projects: ["Built a NestJS + PostgreSQL store API", "Prevented overselling, tested with 20 concurrent orders", "8 stages, CI from day one"],
      Education: ["Backend Development Program"],
    },
  });
});
test("בלי title, בלי אנשי קשר, בלי שם", () => {
  assert.deepEqual(parseCv("# Dan\n\nmail: dan@x.com\n## Skills\n- TS"), { name: "Dan", title: "", contacts: { email: "dan@x.com" }, sections: { Skills: ["TS"] } });
  assert.deepEqual(parseCv("# Dan\n## Skills\n- TS").title, "");
  const late = "# A\nB\n" + "\n".repeat(12) + "a@b.co\n";
  assert.deepEqual(parseCv(late).contacts, {}, "רק ב־10 השורות הראשונות");
  assert.throws(() => parseCv("## Skills\n- x"), Error);
});
