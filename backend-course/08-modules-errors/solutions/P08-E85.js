function snakeToCamel(name) {
  return name.replace(/_([a-z])/g, (all, letter) => letter.toUpperCase());
}

function camelToSnake(name) {
  return name.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase());
}

console.log(snakeToCamel("created_at_utc"), camelToSnake("orderItemsCount"), snakeToCamel("id"));
console.log(camelToSnake(snakeToCamel("user_id")));

module.exports = { snakeToCamel, camelToSnake };
