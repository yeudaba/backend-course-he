function formatRow(label, value, width = 24) {
  if (label.length + value.length >= width) {
    return `${label} ${value}`;
  }
  return label.padEnd(width - value.length, ".") + value;
}

console.log(formatRow("משלוח", "29.90"));
console.log(formatRow("סה״כ", "100", 10));

module.exports = { formatRow };
