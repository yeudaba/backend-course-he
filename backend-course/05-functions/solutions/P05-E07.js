// P05-E07: שטח והיקף של מלבן
function area(width, height) {
  return width * height;
}

function perimeter(width, height) {
  return 2 * (width + height);
}

function describeRect(width, height) {
  return `מלבן ${width}×${height}: שטח ${area(width, height)}, היקף ${perimeter(width, height)}`;
}

console.log(describeRect(3, 4));

module.exports = { area, perimeter, describeRect };
