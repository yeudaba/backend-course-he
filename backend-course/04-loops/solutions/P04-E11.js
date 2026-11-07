const text = "Backend Developers Love Coffee";
let vowels = 0;
let spaces = 0;

for (const ch of text.toLowerCase()) {
  if ("aeiou".includes(ch)) {
    vowels++;
  } else if (ch === " ") {
    spaces++;
  }
}

console.log(`תנועות: ${vowels}`);
console.log(`רווחים: ${spaces}`);
