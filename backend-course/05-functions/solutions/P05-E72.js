function cleanName(name) {
  const trimmed = name.trim();
  if (trimmed === "") {
    return "אורח";
  }
  return trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase();
}

console.log(cleanName("  dANA "), cleanName("   "));

module.exports = { cleanName };
