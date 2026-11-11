const email = "  Dana.Levi@Example.com ";

const clean = email.trim().toLowerCase();
const at = clean.indexOf("@");
const user = clean.slice(0, at);
const domain = clean.slice(at + 1);

console.log(`משתמש: ${user}`);
console.log(`דומיין: ${domain}`);
