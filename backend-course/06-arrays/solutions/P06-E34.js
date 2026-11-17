function middle(arr) {
  return arr[Math.floor(arr.length / 2)];
}

console.log(middle([1, 2, 3]), middle(["a", "b", "c", "d"]));

module.exports = { middle };
