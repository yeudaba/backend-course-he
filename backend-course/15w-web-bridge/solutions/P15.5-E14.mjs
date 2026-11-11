// P15.5-E14: debounce לשדה חיפוש
export function debounce(fn, ms) {
  let timer = null;
  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  }
  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
  };
  return debounced;
}

// המשתמש מקליד "c", "co", "cor", "cors" — 30ms בין הקשות. החיפוש רץ פעם אחת, 100ms אחרי ההקשה האחרונה
const search = debounce((q) => console.log("מחפשים:", q), 100);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
for (const q of ["c", "co", "cor", "cors"]) {
  search(q);
  await sleep(30);
}
await sleep(150);
search("x");
search.cancel();
await sleep(150);
console.log("סוף");
