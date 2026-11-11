// P10-E45: מונה עצלן
function lazyCounter(ms) {
  let count = 0;
  return {
    add(n) {
      setTimeout(() => {
        count += n;
      }, ms);
    },
    get() {
      return count;
    },
  };
}

const c = lazyCounter(20);
c.add(5);
c.add(2);
console.log(c.get());
setTimeout(() => console.log(c.get()), 40);

module.exports = { lazyCounter };
