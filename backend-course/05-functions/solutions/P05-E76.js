function digitsOnly(text) {
  let result = "";
  for (const ch of text) {
    if (ch >= "0" && ch <= "9") {
      result += ch;
    }
  }
  return result;
}

function maskAllButLast(digits, visible = 4) {
  return digits.slice(-visible).padStart(digits.length, "*");
}

function groupBy4(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    if (i > 0 && i % 4 === 0) {
      result += " ";
    }
    result += text[i];
  }
  return result;
}

function maskCard(input) {
  const digits = digitsOnly(input);
  if (digits.length !== 16) {
    return null;
  }
  return groupBy4(maskAllButLast(digits));
}

console.log(maskCard("4580-1234-1234-5678"), maskCard("4580 1234"));

module.exports = { maskCard };
