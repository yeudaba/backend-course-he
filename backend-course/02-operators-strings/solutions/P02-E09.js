const firstName = "dana";
const lastName = "levi";

const initials = `${firstName[0].toUpperCase()}.${lastName[0].toUpperCase()}.`;
const first = firstName[0].toUpperCase() + firstName.slice(1);
const last = lastName[0].toUpperCase() + lastName.slice(1);

console.log(`ראשי תיבות: ${initials}`);
console.log(`שם מלא: ${first} ${last}`);
