// P07-E16: מיזוג הגדרות עם רמה פנימית
function defined(obj = {}) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

function mergeSettings(defaults, userSettings = {}) {
  const user = defined(userSettings);
  return {
    ...defaults,
    ...user,
    notifications: { ...defaults.notifications, ...defined(user.notifications) },
  };
}

const defaults = { theme: "light", language: "he", notifications: { email: true, sms: false } };
console.log(mergeSettings(defaults, { theme: "dark", language: undefined, notifications: { sms: true } }));

module.exports = { mergeSettings };
