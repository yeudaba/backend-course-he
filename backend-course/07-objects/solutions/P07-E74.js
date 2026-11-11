function indexById(items) {
  return new Map(items.map((item) => [item.id, item]));
}

function nameOf(index, id) {
  return index.get(id)?.name ?? "לא נמצא";
}

const index = indexById([{ id: 1, name: "מקלדת" }, { id: 2, name: "עכבר" }]);
console.log(nameOf(index, 1), nameOf(index, 9));

module.exports = { indexById, nameOf };
