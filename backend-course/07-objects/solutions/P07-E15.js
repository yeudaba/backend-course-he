// P07-E15: המרת משתמשים לפורמט ציבורי
function toPublicUsers(users, currentYear) {
  return users
    .filter((u) => !u.isDeleted)
    .map((u) => ({
      id: u.id,
      fullName: `${u.firstName} ${u.lastName}`,
      email: u.email,
      age: currentYear - u.birthYear,
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

const users = [
  { id: 1, firstName: "נועה", lastName: "כהן", email: "n@x.com", passwordHash: "$2b$...", birthYear: 1995, isDeleted: false },
  { id: 2, firstName: "אבי", lastName: "לוי", email: "a@x.com", passwordHash: "$2b$...", birthYear: 1988, isDeleted: false },
  { id: 3, firstName: "גיל", lastName: "בר", email: "g@x.com", passwordHash: "$2b$...", birthYear: 2000, isDeleted: true },
];
console.log(toPublicUsers(users, 2026));

module.exports = { toPublicUsers };
