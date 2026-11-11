function formatPrice(n) {
  return `₪${n.toFixed(2)}`;
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

module.exports = { formatPrice, clamp };
