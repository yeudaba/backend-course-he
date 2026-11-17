// P10-E39: כמה הטיימר איחר?
function measureLateness(requested, blockMs, report) {
  const start = Date.now();
  setTimeout(() => {
    report(Math.max(0, Date.now() - start - requested));
  }, requested);
  while (Date.now() - start < blockMs) {
    // חוסמים בכוונה
  }
}

measureLateness(10, 60, (late) => console.log("עם חסימה:", late >= 45));
measureLateness(50, 0, (late) => console.log("בלי חסימה:", late < 30));

module.exports = { measureLateness };
