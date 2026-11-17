function commonTags(a, b) {
  const inB = new Set(b);
  return [...new Set(a.filter((tag) => inB.has(tag)))];
}

console.log(commonTags(["node", "api", "sql", "api"], ["sql", "node", "redis"]));

module.exports = { commonTags };
