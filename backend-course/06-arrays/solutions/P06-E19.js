// P06-E19: חלוקה לעמודים
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function getPage(arr, page, pageSize) {
  if (page < 1) {
    return [];
  }
  return arr.slice((page - 1) * pageSize, page * pageSize);
}

function totalPages(count, pageSize) {
  return Math.max(1, Math.ceil(count / pageSize));
}

console.log(chunk([1, 2, 3, 4, 5], 2), getPage(["a", "b", "c", "d", "e"], 2, 2), totalPages(0, 10));

module.exports = { chunk, getPage, totalPages };
