const emailInput = "  Dana@Mail.com ";
const email = emailInput.trim().toLowerCase();
const atIndex = email.indexOf("@");
const endsCom = email.endsWith(".com");
const endsCoIl = email.endsWith(".co.il");
console.log(`נקי: ${email}`);
console.log(`יש @? ${email.includes("@")}`);
console.log(`@ לא בהתחלה? ${atIndex > 0}`);
console.log(`נגמר ב־.com או .co.il? ${endsCom !== endsCoIl}`);
