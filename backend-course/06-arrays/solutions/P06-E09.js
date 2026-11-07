// P06-E09: split ו־join
function parseNumbers(text) {
  if (text.trim() === "") {
    return [];
  }
  const result = [];
  for (const part of text.split(",")) {
    result.push(Number(part.trim()));
  }
  return result;
}

function humanList(items) {
  if (items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  return `${items.slice(0, -1).join(", ")} ו־${items[items.length - 1]}`;
}

console.log(parseNumbers("10, 20,30"));
console.log(humanList(["קפה", "תה", "מים"]));

module.exports = { parseNumbers, humanList };
