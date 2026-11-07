// P11-E22: הוסיפו "refunded" — והפונקציה מחזירה undefined עבורו.
// (1) שכחה כזו צריכה לתת שגיאת טיפוסים (2) התווית ל־refunded: "הוחזר"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export function statusLabel(status: PaymentStatus) {
  switch (status) {
    case "pending":
      return "ממתין";
    case "paid":
      return "שולם";
    case "failed":
      return "נכשל";
  }
}
