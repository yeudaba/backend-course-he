// P06-E06: גישה בטוחה לאיברים
function lastItem(arr) {
  return arr[arr.length - 1];
}

function firstAndLast(arr) {
  if (arr.length === 0) {
    return [];
  }
  return [arr[0], arr[arr.length - 1]];
}

function safeGet(arr, index, fallback = null) {
  if (index < 0 || index >= arr.length) {
    return fallback;
  }
  return arr[index];
}

console.log(lastItem([1, 2, 3]), firstAndLast(["a", "b", "c"]), safeGet([10, 20], 5, 0));

module.exports = { lastItem, firstAndLast, safeGet };
