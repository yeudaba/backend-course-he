function fullName(first, last) {
  return `${first.trim()} ${last.trim()}`;
}

console.log(`[${fullName("  Yossi ", "Cohen ")}]`);

module.exports = { fullName };
