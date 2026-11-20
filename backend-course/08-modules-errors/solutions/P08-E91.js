function isHexColor(text) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text);
}

console.log(isHexColor("#fff"), isHexColor("#1A2b3C"), isHexColor("fff"), isHexColor("#ffff"));

module.exports = { isHexColor };
