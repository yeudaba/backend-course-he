function ticker(times, ms, onTick, onDone) {
  function step(n) {
    setTimeout(() => {
      if (n > times) {
        onDone();
        return;
      }
      onTick(n);
      step(n + 1);
    }, ms);
  }
  step(1);
}
module.exports = { ticker };
