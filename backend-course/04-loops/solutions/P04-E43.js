const moneyInput = "20";
const price = 6.5;
const amount = Number(moneyInput);
if (moneyInput.trim() === "" || Number.isNaN(amount)) {
  console.log("שגיאה: סכום לא תקין");
} else {
  let money = amount;
  let cups = 0;
  while (money >= price) {
    money -= price;
    cups++;
  }
  console.log(`נקנו ${cups} ${cups === 1 ? "כוס" : "כוסות"}, נשאר ${money.toFixed(2)} ₪`);
}
