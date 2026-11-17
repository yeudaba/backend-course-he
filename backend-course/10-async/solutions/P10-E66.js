// P10-E66: בדיקת גיל — כ־Promise
function checkAge(age) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (typeof age !== "number" || Number.isNaN(age) || age < 0) {
        reject(new RangeError("גיל לא תקין"));
        return;
      }
      resolve(age >= 18 ? "מותר" : "אסור");
    }, 10);
  });
}

checkAge(20)
  .then(console.log)
  .then(() => checkAge(12))
  .then(console.log)
  .then(() => checkAge(-3))
  .catch((e) => console.log(e.name, e.message));

module.exports = { checkAge };
