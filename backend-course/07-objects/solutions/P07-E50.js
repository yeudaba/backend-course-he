function findByEmail(users, email) {
  const clean = email.trim().toLowerCase();
  return users.find((u) => u.email === clean) ?? null;
}

const users = [{ id: 1, email: "dana@mail.com" }, { id: 2, email: "omer@mail.com" }];
console.log(findByEmail(users, " Dana@Mail.com "), findByEmail(users, "x@mail.com"));

module.exports = { findByEmail };
