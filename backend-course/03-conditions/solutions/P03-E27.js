const phoneInput = " 054-123 4567 ";

const digits = phoneInput.trim().replaceAll("-", "").replaceAll(" ", "");

if (digits.length !== 10 || !digits.startsWith("05")) {
  console.log(`מספר לא תקין: ${phoneInput.trim()}`);
} else {
  const prefix = digits.slice(0, 3);
  console.log(`נקי: ${digits}`);
  console.log(`לתצוגה: ${prefix}-${digits.slice(3)}`);
  console.log(`מוסתר: ${prefix}-***${digits.slice(-4)}`);
}
