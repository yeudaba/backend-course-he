function fullNames(firsts, lasts) {
  return firsts.map((first, i) => `${first} ${lasts[i]}`);
}

console.log(fullNames(["דנה", "עומר"], ["לוי", "כהן"]));

module.exports = { fullNames };
