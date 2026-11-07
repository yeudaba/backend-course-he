// P08-E10: הפיכת שגיאות לערכים
function attempt(fn) {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function firstSuccessful(fns) {
  for (const fn of fns) {
    const result = attempt(fn);
    if (result.ok) {
      return result.value;
    }
  }
  throw new Error("כל הניסיונות נכשלו");
}

console.log(attempt(() => JSON.parse("[1]")), attempt(() => null.x).ok);

module.exports = { attempt, firstSuccessful };
