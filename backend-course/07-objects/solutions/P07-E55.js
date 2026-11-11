function ageGroups(users) {
  const groups = { minors: [], adults: [], seniors: [] };
  for (const u of users) {
    if (u.age < 18) {
      groups.minors.push(u.name);
    } else if (u.age < 65) {
      groups.adults.push(u.name);
    } else {
      groups.seniors.push(u.name);
    }
  }
  return groups;
}

console.log(ageGroups([
  { name: "דנה", age: 31 },
  { name: "עומר", age: 12 },
  { name: "סבתא רחל", age: 70 },
  { name: "נועה", age: 18 },
]));

module.exports = { ageGroups };
