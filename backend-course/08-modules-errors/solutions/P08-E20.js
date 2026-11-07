// P08-E20: מתוקן
const { capitalize, shout } = require("./P08-E20-utils");

function greet(name) {
  return shout(`hello ${capitalize(name)}`);
}

console.log(greet("dana"));

module.exports = { greet };
