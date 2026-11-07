// P06-E24: דוח מכירות שבועי. שלושה מערכים מקבילים.
// bestDay: שם היום עם ההכנסה הגבוהה ביותר
function bestDay(days, revenue) {
  // כתוב כאן
}

// סך ההכנסות / סך ההזמנות, מעוגל ל־2 ספרות; בלי הזמנות → 0
function averageOrderValue(orders, revenue) {
  // כתוב כאן
}

// שמות הימים שבהם ההכנסה מעל threshold
function daysAbove(days, revenue, threshold) {
  // כתוב כאן
}

// ["ראשון: 12 הזמנות, ₪1,840", ..., "סה״כ: 70 הזמנות, ₪9,330"]
// מותר: n.toLocaleString("en-US") לפסיקים באלפים
function reportLines(days, orders, revenue) {
  // כתוב כאן
}

const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const orders = [12, 8, 10, 9, 15, 16, 0];
const revenue = [1840, 1100, 1390, 1200, 1950, 1850, 0];
console.log(bestDay(days, revenue));

module.exports = { bestDay, averageOrderValue, daysAbove, reportLines };
