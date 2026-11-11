// P10-E35: לחסום בכוונה
function blockFor(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // לא עושים כלום — רק תופסים את המלצר
  }
  return Date.now() - start;
}

setTimeout(() => console.log("טיימר"), 0);
console.log(blockFor(50) >= 50);
console.log("אחרי החסימה");

module.exports = { blockFor };
