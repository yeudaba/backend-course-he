function splitBill(total, people, tipPercent = 10) {
  if (!(total > 0)) {
    return null;
  }
  if (!Number.isInteger(people) || people < 1) {
    return null;
  }
  const withTip = total * (1 + tipPercent / 100);
  return Math.ceil(withTip / people);
}

function billSummary(total, people, tipPercent = 10) {
  const each = splitBill(total, people, tipPercent);
  if (each === null) {
    return "קלט לא תקין";
  }
  return `${people} סועדים × ${each} ₪ = ${people * each} ₪ (כולל טיפ ${tipPercent}%)`;
}

console.log(splitBill(487, 6, 12));
console.log(billSummary(100, 4));
console.log(billSummary(100, 2.5));

module.exports = { splitBill, billSummary };
