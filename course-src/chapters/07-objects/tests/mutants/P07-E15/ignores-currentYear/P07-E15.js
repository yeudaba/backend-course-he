function toPublicUsers(users, currentYear) {
  return users.filter((u) => !u.isDeleted)
    .map((u) => ({ id: u.id, fullName: `${u.firstName} ${u.lastName}`, email: u.email, age: 2026 - u.birthYear }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}
module.exports = { toPublicUsers };
