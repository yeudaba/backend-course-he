// P10-E33: להגיד משהו אחר כך
function sayLater(text, ms, log) {
  setTimeout(() => log(text), ms);
}

sayLater("שלום", 30, console.log);
console.log("קודם אני");

module.exports = { sayLater };
