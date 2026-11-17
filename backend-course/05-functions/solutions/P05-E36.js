function toAgorot(shekels) {
  return Math.round(shekels * 100);
}

function agorotToText(agorot) {
  const shekels = Math.floor(agorot / 100);
  const rest = `${agorot % 100}`.padStart(2, "0");
  return `${shekels}.${rest} ₪`;
}

console.log(toAgorot(0.29), agorotToText(toAgorot(19.99)));

module.exports = { toAgorot, agorotToText };
