const totalItems = 47;
const pageSize = 10;
const page = 3;

const pages = Math.ceil(totalItems / pageSize);
const lastPageItems = totalItems - (pages - 1) * pageSize;
const from = (page - 1) * pageSize + 1;
const to = page * pageSize;

console.log(`סה״כ תוצאות: ${totalItems}`);
console.log(`עמודים: ${pages}`);
console.log(`תוצאות בעמוד האחרון: ${lastPageItems}`);
console.log(`עמוד ${page} מציג את תוצאות ${from} עד ${to}`);
