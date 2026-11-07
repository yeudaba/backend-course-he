const text = "Was it a car or a cat I saw";
const clean = text.toLowerCase().replaceAll(" ", "");

// פתרון 1: היפוך
let reversed = "";
for (const ch of clean) {
  reversed = ch + reversed;
}
console.log(`פלינדרום? ${clean === reversed}`);

// פתרון 2: שני מצביעים
let isPalindrome = true;
for (let i = 0; i < clean.length / 2; i++) {
  if (clean[i] !== clean[clean.length - 1 - i]) {
    isPalindrome = false;
    break;
  }
}
console.log(`פלינדרום? ${isPalindrome}`);
