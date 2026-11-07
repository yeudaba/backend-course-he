const role = "viewer";
const age = 17;

const isAllowedRole = role === "admin" || role === "owner";
const isAdult = age >= 18;

console.log("מותר לצפות?", isAllowedRole && isAdult);
