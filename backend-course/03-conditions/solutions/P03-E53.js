const totalSpent = 1250;
let tier;
let nextAt = null;
if (totalSpent >= 5000) {
  tier = "פלטינה";
} else if (totalSpent >= 2000) {
  tier = "זהב";
  nextAt = 5000;
} else if (totalSpent >= 500) {
  tier = "כסף";
  nextAt = 2000;
} else {
  tier = "רגיל";
  nextAt = 500;
}
console.log(`דרגה: ${tier}`);
if (nextAt === null) {
  console.log("זו הדרגה הגבוהה ביותר");
} else {
  console.log(`עוד ${nextAt - totalSpent} ₪ לדרגה הבאה`);
}
