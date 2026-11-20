function measureLateness(requested, blockMs, report) {
  const start = Date.now();
  setTimeout(() => report(Date.now() - start), requested);
  while (Date.now() - start < blockMs) {
    // חוסמים
  }
}
module.exports = { measureLateness };
