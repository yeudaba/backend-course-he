function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

const user = { id: 1, name: "דנה", passwordHash: "x9f...", email: "d@m.com" };
console.log(pick(user, ["id", "name", "email"]), pick(user, ["id", "phone"]));

module.exports = { pick };
