// P06-E28: מחירון עם נקודות
function line(label, amount) {
  const name = label.length > 16 ? label.slice(0, 15) + "…" : label;
  return name.padEnd(16, ".") + amount.toFixed(2).padStart(8, ".");
}

function priceList(names, prices) {
  const rows = names.map((name, i) => line(name, prices[i]));
  const total = prices.reduce((sum, p) => sum + p, 0);
  return [...rows, line("TOTAL", total)];
}

const lines = priceList(["Keyboard", "Mouse", "Mechanical keyboard RGB"], [199, 89.9, 450]);
console.log(lines.join("\n"));

module.exports = { priceList };
