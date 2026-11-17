function search(names, query) {
  const q = query.trim().toLowerCase();
  return names.filter((name) => name.toLowerCase().includes(q));
}

function countMatches(names, query) {
  return search(names, query).length;
}

const products = ["Laptop Pro", "USB cable", "laptop stand", "Mouse"];
console.log(search(products, "laptop"), countMatches(products, ""));

module.exports = { search, countMatches };
