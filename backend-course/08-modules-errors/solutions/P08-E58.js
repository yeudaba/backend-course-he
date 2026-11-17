function topFrame(err) {
  const line = err.stack.split("\n").find((l) => l.trim().startsWith("at "));
  return line === undefined ? null : line.trim();
}

try {
  null.price;
} catch (err) {
  console.log(topFrame(err).startsWith("at Object.<anonymous>"));
}

module.exports = { topFrame };
