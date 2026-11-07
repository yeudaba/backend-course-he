const input = "  learn   node and express ";
const text = input.trim();
let result = "";
let atWordStart = true;

for (const ch of text) {
  if (ch === " ") {
    if (result[result.length - 1] !== " ") {
      result += " ";
    }
    atWordStart = true;
  } else if (atWordStart) {
    result += ch.toUpperCase();
    atWordStart = false;
  } else {
    result += ch.toLowerCase();
  }
}

console.log(`[${result}]`);
