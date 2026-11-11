function insertAt(arr, index, item) {
  return [...arr.slice(0, index), item, ...arr.slice(index)];
}

function moveItem(arr, from, to) {
  const item = arr[from];
  const without = [...arr.slice(0, from), ...arr.slice(from + 1)];
  return insertAt(without, to, item);
}

const letters = ["a", "b", "c", "d"];
console.log(insertAt(letters, 1, "X"), moveItem(letters, 0, 2), letters);

module.exports = { insertAt, moveItem };
