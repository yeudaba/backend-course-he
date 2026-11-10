// P05-E26: מונה עם זיכרון
function makeCounter(start = 0) {
  let count = start;
  return () => {
    count++;
    return count;
  };
}

const visits = makeCounter();
const tickets = makeCounter(100);
console.log(visits(), visits(), tickets(), visits());

module.exports = { makeCounter };
