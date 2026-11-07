// P06-E24: דוח מכירות שבועי
const sum = (nums) => nums.reduce((s, n) => s + n, 0);
const money = (n) => `₪${n.toLocaleString("en-US")}`;

function bestDay(days, revenue) {
  const index = revenue.indexOf(Math.max(...revenue));
  return days[index];
}

function averageOrderValue(orders, revenue) {
  const totalOrders = sum(orders);
  if (totalOrders === 0) {
    return 0;
  }
  return Math.round((sum(revenue) / totalOrders) * 100) / 100;
}

function daysAbove(days, revenue, threshold) {
  return days.filter((_, i) => revenue[i] > threshold);
}

function reportLines(days, orders, revenue) {
  const lines = days.map((d, i) => `${d}: ${orders[i]} הזמנות, ${money(revenue[i])}`);
  lines.push(`סה״כ: ${sum(orders)} הזמנות, ${money(sum(revenue))}`);
  return lines;
}

const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const orders = [12, 8, 10, 9, 15, 16, 0];
const revenue = [1840, 1100, 1390, 1200, 1950, 1850, 0];
console.log(bestDay(days, revenue), averageOrderValue(orders, revenue));
console.log(reportLines(days, orders, revenue).join("\n"));

module.exports = { bestDay, averageOrderValue, daysAbove, reportLines };
