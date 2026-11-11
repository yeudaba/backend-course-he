const typedRole = "  ADMIN ";
const savedRole = "admin";
const cleanRole = typedRole.trim().toLowerCase();
console.log(`השוואה ישירה: ${typedRole === savedRole}`);
console.log(`אחרי ניקוי: ${cleanRole === savedRole}`);
