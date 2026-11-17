const ROLES = ["viewer", "editor", "admin"];

function roleLevel(role) {
  return ROLES.indexOf(role);
}

function canAccess(role, required) {
  const level = roleLevel(role);
  const requiredLevel = roleLevel(required);
  if (level === -1 || requiredLevel === -1) {
    return false;
  }
  return level >= requiredLevel;
}

console.log(canAccess("admin", "editor"), canAccess("viewer", "editor"), canAccess("owner", "viewer"));

module.exports = { roleLevel, canAccess };
