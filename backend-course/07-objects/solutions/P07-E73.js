function hasDuplicates(list) {
  return new Set(list).size !== list.length;
}

console.log(hasDuplicates([1, 2, 3]), hasDuplicates(["a", "b", "a"]));

module.exports = { hasDuplicates };
