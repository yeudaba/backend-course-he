// P08-E06: קבלה שמשתמשת במודול העיצוב
const { formatPrice, formatLine } = require("./P08-E06-format");

function receipt(items) {
  const total = items.reduce((s, i) => s + i.price, 0);
  return [...items.map((i) => formatLine(i.name, i.price)), `סה״כ: ${formatPrice(total)}`].join("\n");
}

console.log(receipt([{ name: "עט", price: 5 }, { name: "מחברת", price: 12.5 }]));

module.exports = { receipt };
