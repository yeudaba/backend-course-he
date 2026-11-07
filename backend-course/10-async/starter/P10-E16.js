// P10-E16: ניסיונות חוזרים עם המתנה baseDelay * 2^(attempt-1)
// log(`attempt ${n} failed: ${err.message}`) על כל כישלון שאחריו יש עוד ניסיון
async function retryAsync(fn, { attempts = 3, baseDelay = 10, log = () => {} } = {}) {
  // כתוב כאן
}

module.exports = { retryAsync };
