// תרחיש אחד שרץ על כל מימוש של CustomersRepository (P19-E83, P19-E84) ומחזיר את כל התוצאות
export async function scenario(repo) {
  const out = [];
  const step = async (name, fn) => {
    try {
      out.push([name, await fn()]);
    } catch (err) {
      out.push([name, { error: err.code ?? err.message }]);
    }
  };
  await step("findById(1)", () => repo.findById(1));
  await step("findById(99)", () => repo.findById(99));
  await step("findByEmail(Dana@Example.com)", () => repo.findByEmail("Dana@Example.com"));
  await step("findByEmail(nobody)", () => repo.findByEmail("nobody@example.com"));
  await step("insert(tal)", () => repo.insert({ fullName: "Tal Gil", email: "tal@example.com", city: "Eilat" }));
  await step("insert(tal again)", () => repo.insert({ fullName: "Tal 2", email: "tal@example.com", city: null }));
  let lior;
  await step("insert(lior)", async () => (lior = await repo.insert({ fullName: "Lior", email: "lior@example.com", city: null })));
  await step("findByEmail(TAL@EXAMPLE.COM)", () => repo.findByEmail("TAL@EXAMPLE.COM"));
  await step("delete(lior)", () => repo.delete(lior?.id));
  await step("delete(lior) again", () => repo.delete(lior?.id));
  await step("findById(lior)", () => repo.findById(lior?.id));
  await step("findById(9)", () => repo.findById(9));
  return out;
}
export const SEED = [
  { id: 1, fullName: "Dana Levi", email: "dana@example.com", city: "Tel Aviv" },
  { id: 2, fullName: "Yossi Cohen", email: "yossi@example.com", city: "Haifa" },
  { id: 3, fullName: "Noa Mizrahi", email: "noa@example.com", city: "Jerusalem" },
  { id: 4, fullName: "Avi Peretz", email: "avi@example.com", city: null },
  { id: 5, fullName: "Michal Biton", email: "michal@example.com", city: "Tel Aviv" },
  { id: 6, fullName: "Ron Avraham", email: "ron@example.com", city: "Beer Sheva" },
  { id: 7, fullName: "Shira David", email: "shira@example.com", city: "Haifa" },
  { id: 8, fullName: "Omer Shalom", email: "omer@example.com", city: null },
];
