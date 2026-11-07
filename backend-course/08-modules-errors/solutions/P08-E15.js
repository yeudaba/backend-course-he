// P08-E15: ניסיונות חוזרים
function retry(fn, times) {
  let lastError;
  for (let attempt = 1; attempt <= times; attempt++) {
    try {
      return fn(attempt);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

const flaky = (n) => {
  if (n < 3) throw new Error(`ניסיון ${n} נכשל`);
  return `הצליח בניסיון ${n}`;
};
console.log(retry(flaky, 5));
try {
  retry(flaky, 2);
} catch (err) {
  console.log(err.message);
}

module.exports = { retry };
