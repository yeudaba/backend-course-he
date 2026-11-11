// P10-E38: עבודה כבדה בחתיכות
function inChunks(items, size, work, done) {
  function runFrom(start) {
    setTimeout(() => {
      const end = Math.min(start + size, items.length);
      for (let i = start; i < end; i++) {
        work(items[i]);
      }
      if (end >= items.length) {
        done();
      } else {
        runFrom(end);
      }
    }, 0);
  }
  runFrom(0);
}

const out = [];
inChunks([1, 2, 3, 4, 5], 2, (n) => out.push(`עבודה ${n}`), () => console.log(out.join(", ") + ", סוף"));
setTimeout(() => out.push("בקשה אחרת"), 0);

module.exports = { inChunks };
