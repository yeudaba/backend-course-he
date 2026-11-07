// P22-E13: אי אפשר לבדוק את זה — התוצאה תלויה בשעה, במזל, ובכמה פעמים קראו לפונקציה קודם (גם בבדיקות אחרות).
// כתוב במקומה createInvoiceNumberer({ now, random }) לפי דף התרגילים.
let counter = 0;

export function createInvoiceNumber(): string {
  counter++;
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `INV-${d.getFullYear()}${month}-${String(counter).padStart(4, "0")}-${rand}`;
}
