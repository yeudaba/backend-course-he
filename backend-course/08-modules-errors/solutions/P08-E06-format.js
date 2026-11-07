// P08-E06: פונקציות עיצוב
function formatPrice(n) {
  return `₪${n.toFixed(2)}`;
}

function formatLine(name, price) {
  return `${name}: ${formatPrice(price)}`;
}

module.exports = { formatPrice, formatLine };
