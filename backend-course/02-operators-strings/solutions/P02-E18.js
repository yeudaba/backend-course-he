const weightInput = "72.5";
const kgToLb = 2.20462;

const kg = Number(weightInput);
const lb = kg * kgToLb;

console.log(`${kg} ק״ג = ${lb.toFixed(2)} פאונד`);
console.log(`בדיקת קלט: ${weightInput} הוא מספר? ${Number.isNaN(kg) === false}`);
