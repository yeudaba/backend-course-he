function shrink(input, fails) {
  let current = [...input];
  let changed = true;
  while (changed) {
    changed = false;
    let i = 0;
    while (i < current.length) {
      const candidate = [...current.slice(0, i), ...current.slice(i + 1)];
      if (fails(candidate)) {
        current = candidate;
        changed = true;
      } else {
        i++;
      }
    }
  }
  return current;
}

const fails = (arr) => arr.includes(0) && arr.some((n) => n < 0);
const input = [5, 0, 8, -3, 2, 0, 7];
console.log(shrink(input, fails), input);

module.exports = { shrink };
