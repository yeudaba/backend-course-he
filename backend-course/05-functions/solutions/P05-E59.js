const transformText = (text, fn) => {
  let result = "";
  for (const ch of text) {
    result += fn(ch);
  }
  return result;
};

const shout = (text) => `${text.toUpperCase()}!`;

console.log(transformText("abc", (ch) => ch + ch), shout("hi"));

module.exports = { transformText, shout };
