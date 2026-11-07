// P08-E09: JSON.parse עם טיפול בשגיאות
function safeParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function parseOrThrow(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("JSON לא תקין");
  }
}

console.log(safeParse('{"a":1}'), safeParse("{oops", {}));

module.exports = { safeParse, parseOrThrow };
