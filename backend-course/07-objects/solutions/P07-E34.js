function makeUser(name, age) {
  return {
    name: name.trim(),
    age: age,
    isAdult: age >= 18,
  };
}

console.log(makeUser("  דנה ", 31));

module.exports = { makeUser };
