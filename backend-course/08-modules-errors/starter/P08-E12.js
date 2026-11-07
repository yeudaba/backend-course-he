// P08-E12: הרץ npx eslint על הקובץ ותקן הכול.
// סטטוס מגיע מה־URL כמחרוזת: "1" = פעיל. כל ערך אחר ("0", ריק, "2", "abc") = לא פעיל.
var ACTIVE = 1;

function isActive(statusFromUrl) {
  let unused = "debug";
  return statusFromUrl != 0;
}

function countActive(statuses) {
  let count = 0;
  let list = statuses;
  for (const s of list) {
    if (isActive(s)) {
      count++;
    }
  }
  return count;
}

module.exports = { isActive, countActive };
