const bill = 487;
const tipPercent = 12;
const diners = 6;

const tip = (bill * tipPercent) / 100;
const totalWithTip = bill + tip;
const perPerson = Math.ceil(totalWithTip / diners);
const collected = perPerson * diners;
const extra = collected - totalWithTip;

console.log(`חשבון: ${bill}`);
console.log(`טיפ (${tipPercent}%): ${tip.toFixed(2)}`);
console.log(`סה״כ עם טיפ: ${totalWithTip.toFixed(2)}`);
console.log(`כל אחד משלם: ${perPerson}`);
console.log(`נאסף בפועל: ${collected}`);
console.log(`עודף לטיפ: ${extra.toFixed(2)}`);
