// P05-E12: פונקציות שמקבלות פונקציה
// applyTwice(fn, value): fn(fn(value))
// applyN(fn, value, times): מפעילה fn שוב ושוב, times פעמים
function applyTwice(fn, value) {
  // כתוב כאן
}

function applyN(fn, value, times) {
  // כתוב כאן
}

console.log(applyTwice((x) => x + 3, 10)); // 16
console.log(applyN((s) => s + "!", "היי", 3)); // "היי!!!"

module.exports = { applyTwice, applyN };
