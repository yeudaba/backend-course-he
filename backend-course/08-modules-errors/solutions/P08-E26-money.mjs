// P08-E26: מודול כסף
export function toAgorot(shekels) {
  return Math.round(shekels * 100);
}

export function formatILS(agorot) {
  return `₪${(agorot / 100).toFixed(2)}`;
}
