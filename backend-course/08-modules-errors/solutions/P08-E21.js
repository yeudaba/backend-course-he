// P08-E21: טיפול נכון בשגיאות
function parseAge(text) {
  const age = Number(text);
  if (!Number.isInteger(age) || age < 0) {
    throw new Error(`גיל לא תקין: ${text}`);
  }
  return age;
}

function ageOrNull(text) {
  try {
    return parseAge(text);
  } catch {
    return null;
  }
}

function strictAge(text) {
  try {
    return parseAge(text);
  } finally {
    console.log(`נבדק: ${text}`);
  }
}

console.log(ageOrNull("abc"), strictAge("30"));

module.exports = { parseAge, ageOrNull, strictAge };
