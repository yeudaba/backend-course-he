// P11-E61: מזהה לתצוגה
export function formatId(id: string | number): string {
  if (typeof id === "number") {
    return "#" + String(id).padStart(4, "0");
  }
  return id.trim().toUpperCase();
}

console.log(formatId(42), formatId(12345), formatId(" ab-7 "));
