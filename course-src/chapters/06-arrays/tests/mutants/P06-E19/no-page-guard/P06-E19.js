function chunk(arr, size) { const r = []; for (let i = 0; i < arr.length; i += size) r.push(arr.slice(i, i + size)); return r; }
const getPage = (arr, page, pageSize) => arr.slice((page - 1) * pageSize, page * pageSize);
const totalPages = (count, pageSize) => Math.max(1, Math.ceil(count / pageSize));
module.exports = { chunk, getPage, totalPages };
