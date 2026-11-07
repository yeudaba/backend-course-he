// P07-E17: השוואת שני אובייקטים
function diff(before, after) {
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  return keys
    .filter((key) => before[key] !== after[key])
    .map((key) => ({ key, from: before[key], to: after[key] }));
}

console.log(diff({ name: "עט", price: 5, color: "כחול" }, { name: "עט", price: 4, size: "M" }));

module.exports = { diff };
