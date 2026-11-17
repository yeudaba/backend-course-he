function visit(history, page, max = 5) {
  const clean = page.trim();
  if (clean === "") {
    return history;
  }
  if (history.at(-1) === clean) {
    return history;
  }
  history.push(clean);
  if (history.length > max) {
    history.shift();
  }
  return history;
}

const h = ["/home", "/products"];
console.log(visit(h, "/products"));
console.log(visit(h, " /cart "));
console.log(visit(h, "/home", 3));

module.exports = { visit };
