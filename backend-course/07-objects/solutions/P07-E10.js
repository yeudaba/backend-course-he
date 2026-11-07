// P07-E10: מיון לפי שדה
const sortByPrice = (products) => [...products].sort((a, b) => a.price - b.price);
const sortByName = (products) => [...products].sort((a, b) => a.name.localeCompare(b.name));
const cheapest = (products) => sortByPrice(products)[0] ?? null;

const products = [
  { name: "מסך", price: 899 },
  { name: "עכבר", price: 89 },
];
console.log(cheapest(products).name, sortByName(products).map((p) => p.name));

module.exports = { sortByPrice, sortByName, cheapest };
