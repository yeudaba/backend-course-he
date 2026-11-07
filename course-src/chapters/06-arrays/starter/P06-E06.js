// P06-E06: גישה בטוחה לאיברים
// lastItem([1,2,3]) → 3 | lastItem([]) → undefined
function lastItem(arr) {
  // כתוב כאן
}

// firstAndLast(["a","b","c"]) → ["a","c"] | firstAndLast([]) → []
function firstAndLast(arr) {
  // כתוב כאן
}

// safeGet([10,20], 5, 0) → 0 | safeGet([10,20], 1) → 20 | אינדקס שלילי → fallback
function safeGet(arr, index, fallback = null) {
  // כתוב כאן
}

module.exports = { lastItem, firstAndLast, safeGet };
