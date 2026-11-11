// P15.5-E44: לחשב specificity
export function specificity(selector) {
  const ids = (selector.match(/#[\w-]+/g) ?? []).length;
  const classes = (selector.match(/\.[\w-]+|\[[^\]]+\]|:[\w-]+/g) ?? []).length;
  const tags = selector
    .trim()
    .split(/\s+/)
    .filter((part) => /^[a-z][\w-]*/i.test(part)).length;
  return [ids, classes, tags];
}

function compare(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

export function winner(element, rules) {
  let best;
  for (const rule of rules) {
    if (!best || compare(specificity(rule.selector), specificity(best.selector)) >= 0) best = rule;
  }
  return best?.value;
}

for (const s of ["#main .card h2:hover", "ul li.done", ".card .title", "h2", "*", "input[type=email]"]) {
  console.log(s.padEnd(22), specificity(s));
}
console.log(winner(null, [{ selector: ".card h2", value: "orange" }, { selector: ".title", value: "blue" }]));
console.log(winner(null, [{ selector: ".title", value: "blue" }, { selector: ".big", value: "purple" }]));
