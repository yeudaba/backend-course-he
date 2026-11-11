// P08-E27: כפילויות ברשימת הרשמה
function findDuplicates(emails) {
  if (!Array.isArray(emails)) {
    throw new TypeError("emails חייב להיות מערך");
  }
  const seen = new Set();
  const dups = new Set();
  for (const raw of emails) {
    const email = raw.trim().toLowerCase();
    if (seen.has(email)) {
      dups.add(email);
    } else {
      seen.add(email);
    }
  }
  return [...dups];
}

console.log(findDuplicates(["a@x.com", "b@x.com", " A@x.com", "c@x.com", "b@x.com", "a@x.com"]));
try {
  findDuplicates("a@x.com");
} catch (err) {
  console.log(`${err.name}: ${err.message}`);
}

module.exports = { findDuplicates };
