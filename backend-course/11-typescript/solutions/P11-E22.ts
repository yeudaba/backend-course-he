// P11-E22: מתוקן
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export function statusLabel(status: PaymentStatus): string {
  switch (status) {
    case "pending":
      return "ממתין";
    case "paid":
      return "שולם";
    case "failed":
      return "נכשל";
    case "refunded":
      return "הוחזר";
    default: {
      const unhandled: never = status;
      throw new Error(`סטטוס לא מוכר: ${unhandled}`);
    }
  }
}

console.log(statusLabel("refunded"));
