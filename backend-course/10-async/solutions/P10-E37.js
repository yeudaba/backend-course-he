// P10-E37: מתי כולם סיימו?
function afterAll(delays, done) {
  if (delays.length === 0) {
    setTimeout(() => done([]), 0);
    return;
  }
  const order = [];
  for (const ms of delays) {
    setTimeout(() => {
      order.push(ms);
      if (order.length === delays.length) done(order);
    }, ms);
  }
}

afterAll([30, 10, 20], (order) => console.log(order));
afterAll([], (order) => console.log("ריק:", order));

module.exports = { afterAll };
