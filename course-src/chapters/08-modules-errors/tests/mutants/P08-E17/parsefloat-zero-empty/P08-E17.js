function parseLine(line) {
  const parts = line.split(",").map((p) => p.trim());
  if (parts.length < 3) throw new Error("חסרים שדות");
  const [date, category, amountText] = parts;
  const amount = parseFloat(amountText);
  if (Number.isNaN(amount) || amount < 0) throw new Error("סכום לא תקין");
  return { date, category, amount };
}
function parseExpenses(text) {
  const expenses = [], errors = [];
  text.split("\n").forEach((l, i) => { if (!l.trim()) return; try { expenses.push(parseLine(l)); } catch (e) { errors.push({ line: i + 1, message: e.message }); } });
  return { expenses, errors };
}
module.exports = { parseLine, parseExpenses };
