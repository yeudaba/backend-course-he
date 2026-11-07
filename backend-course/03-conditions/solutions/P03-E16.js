const pageParam = undefined;
const limitParam = 0;
const sortParam = "";
const minPriceParam = 0;

const page = pageParam ?? 1;
const rawLimit = limitParam ?? 20;
const limit = rawLimit < 1 || rawLimit > 100 ? 20 : rawLimit;
const sort = sortParam || "newest";
const minPrice = minPriceParam ?? 0;

console.log(`page=${page} limit=${limit} sort=${sort} minPrice=${minPrice}`);
