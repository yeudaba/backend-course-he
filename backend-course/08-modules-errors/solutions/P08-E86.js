const PRICE = /^₪?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?$/;

function parsePrice(text) {
  const m = text.trim().match(PRICE);
  if (m === null) {
    throw new Error(`מחיר לא תקין: "${text}"`);
  }
  const shekels = Number(m[1].replace(/,/g, ""));
  const agorot = Number((m[2] ?? "").padEnd(2, "0"));
  return shekels * 100 + agorot;
}

for (const input of ["12", "12.5", " ₪ 1,234.50 ", "0.99", "12,50", "12.345", "-5"]) {
  try {
    console.log(input, "←", parsePrice(input));
  } catch (err) {
    console.log(`✘ ${err.message}`);
  }
}

module.exports = { parsePrice };
