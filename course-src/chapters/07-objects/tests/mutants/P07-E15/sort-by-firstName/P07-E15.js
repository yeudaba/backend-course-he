function toPublicUsers(users, currentYear) {
  return users.filter((u) => !u.isDeleted)
    .sort((a, b) => a.firstName.localeCompare(b.firstName))
    .map((u) => ({ id: u.id, fullName: `${u.firstName} ${u.lastName}`, email: u.email, age: currentYear - u.birthYear }));
}
module.exports = { toPublicUsers };
