const statuses = "PPDCPD";

let paid = 0;
let delivered = 0;
let cancelled = 0;
let unknown = 0;

for (const ch of statuses) {
  switch (ch) {
    case "P":
      paid++;
      break;
    case "D":
      delivered++;
      break;
    case "C":
      cancelled++;
      break;
    default:
      unknown++;
  }
}

console.log(`שולמו: ${paid} | נמסרו: ${delivered} | בוטלו: ${cancelled} | לא מוכר: ${unknown}`);
