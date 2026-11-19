function toPublicUsers(users, currentYear) {
  return users.filter((u) => !u.isDeleted).map((u) => {
    delete u.passwordHash; delete u.isDeleted;
    u.fullName = `${u.firstName} ${u.lastName}`; u.age = currentYear - u.birthYear;
    delete u.firstName; delete u.lastName; delete u.birthYear;
    return u;
  }).sort((a, b) => a.fullName.localeCompare(b.fullName));
}
module.exports = { toPublicUsers };
