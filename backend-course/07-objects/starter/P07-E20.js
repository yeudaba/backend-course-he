// P07-E20: שלושה באגים
// toSummaries → [{ name, price }, ...]
const toSummaries = (products) => products.map((p) => { name: p.name, price: p.price });

// המוצר עם השם הזה, או null
const findByName = (products, name) => products.filter((p) => p.name === name) ?? null;

// רק המוצרים שהמלאי שלהם 0 (בלי לשנות אותם!)
const outOfStock = (products) => products.filter((p) => (p.stock = 0));

module.exports = { toSummaries, findByName, outOfStock };
