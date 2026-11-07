// P08-E20: התוכנית קורסת. שלושה באגים בייצוא/ייבוא (בקובץ הזה וב־P08-E20-utils.js).
// greet("dana") → "HELLO DANA!"
const { capitalize, shout } = require("P08-E20-utils");

function greet(name) {
  return shout(`hello ${capitalize(name)}`);
}

console.log(greet("dana"));

module.exports = { greet };
