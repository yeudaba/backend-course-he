// P07-E09: find / map / filter / reduce על אובייקטים
const findById = (items, id) => items.find((it) => it.id === id) ?? null;
const namesOf = (items) => items.map((it) => it.name);
const inStock = (items) => items.filter((it) => it.stock > 0);
const totalStock = (items) => items.reduce((s, it) => s + it.stock, 0);

const items = [
  { id: 1, name: "עט", stock: 3 },
  { id: 2, name: "דף", stock: 0 },
];
console.log(findById(items, 2), namesOf(items), inStock(items).length, totalStock(items));

module.exports = { findById, namesOf, inStock, totalStock };
