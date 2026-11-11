function normalize(text) {
  let result = "";
  for (const ch of text.toLowerCase()) {
    if ((ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9")) {
      result += ch;
    }
  }
  return result;
}

function reverse(text) {
  let result = "";
  for (const ch of text) {
    result = ch + result;
  }
  return result;
}

function isPalindrome(text) {
  const clean = normalize(text);
  return clean === reverse(clean);
}

console.log(normalize("Was it a car?"), isPalindrome("Was it a car or a cat I saw"));

module.exports = { normalize, reverse, isPalindrome };
