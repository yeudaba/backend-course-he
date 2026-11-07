// P22-E13 — אחרי השינוי: כל מה שלא צפוי (שעה, אקראיות) מוזרק, וה־counter שייך למופע
export interface InvoiceDeps {
  now?: () => Date;
  random?: () => number; // [0, 1)
}

export function createInvoiceNumberer({ now = () => new Date(), random = Math.random }: InvoiceDeps = {}) {
  let counter = 0;
  return function next(): string {
    counter++;
    const d = now();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0"); // UTC: אותה תוצאה בכל אזור זמן
    const rand = String(Math.floor(random() * 1000)).padStart(3, "0");
    return `INV-${d.getUTCFullYear()}${month}-${String(counter).padStart(4, "0")}-${rand}`;
  };
}
