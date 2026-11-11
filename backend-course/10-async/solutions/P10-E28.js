// P10-E28: כל העמודים
async function fetchAll(getPage, maxPages = 100) {
  const all = [];
  let page = 1;
  let count = 0;
  while (page !== null) {
    if (count === maxPages) {
      throw new Error("יותר מדי עמודים");
    }
    const { items, next } = await getPage(page);
    all.push(...items);
    page = next;
    count++;
  }
  return all;
}

const pages = {
  1: { items: ["a", "b"], next: 2 },
  2: { items: ["c"], next: 3 },
  3: { items: [], next: null },
};
const getPage = async (n) => {
  console.log(`מביא עמוד ${n}`);
  return pages[n];
};

fetchAll(getPage).then((all) => console.log(all));

module.exports = { fetchAll };
