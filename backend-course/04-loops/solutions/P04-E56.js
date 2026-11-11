const totalItems = 47;
const pageSize = 10;
const pages = Math.ceil(totalItems / pageSize);
for (let page = 1; page <= pages; page++) {
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);
  console.log(`עמוד ${page}: פריטים ${first}–${last}`);
}
