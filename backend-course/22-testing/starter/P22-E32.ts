// P22-E32 — הקוד שבודקים (לא משנים אותו)
// דמי משלוח באגורות: בישראל 2990, חינם מ־20,000 ומעלה. לחו״ל 9990, חינם מ־50,000 ומעלה.
export function shippingCost(totalAgorot: number, country: "IL" | "abroad"): number {
  if (!Number.isInteger(totalAgorot) || totalAgorot <= 0) throw new RangeError("סכום ההזמנה חייב להיות מספר שלם חיובי (אגורות)");
  if (country === "IL") return totalAgorot >= 20000 ? 0 : 2990;
  if (country === "abroad") return totalAgorot >= 50000 ? 0 : 9990;
  throw new RangeError(`מדינה לא מוכרת: ${country}`);
}
