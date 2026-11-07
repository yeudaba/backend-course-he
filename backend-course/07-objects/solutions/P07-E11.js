// P07-E11: עדכונים בלי לשנות את המקור
const withPrice = (product, newPrice) => ({ ...product, price: newPrice });

function without(obj, key) {
  const copy = { ...obj };
  delete copy[key];
  return copy;
}

const withTag = (product, tag) => ({ ...product, tags: [...product.tags, tag] });

const p = { name: "עט", price: 5, tags: ["משרד"] };
console.log(withPrice(p, 4), without(p, "tags"), withTag(p, "כחול"), p);

module.exports = { withPrice, without, withTag };
