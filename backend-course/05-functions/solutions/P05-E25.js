// P05-E25: עיצוב מספר עם פסיקים
function addCommas(digits) {
  let result = "";
  let count = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      result = "," + result;
    }
    result = digits[i] + result;
    count++;
  }
  return result;
}

function formatNumber(n, decimals = 2) {
  const sign = n < 0 ? "-" : "";
  const fixed = Math.abs(n).toFixed(decimals);
  const dot = fixed.indexOf(".");
  const intPart = dot === -1 ? fixed : fixed.slice(0, dot);
  const decPart = dot === -1 ? "" : fixed.slice(dot);
  return sign + addCommas(intPart) + decPart;
}

console.log(formatNumber(1234567.891));
console.log(formatNumber(-1234.5, 1));
console.log(formatNumber(1000000, 0));

module.exports = { formatNumber, addCommas };
