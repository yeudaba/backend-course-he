function mergeSettings(defaults, userSettings = {}) {
  const user = Object.fromEntries(Object.entries(userSettings).filter(([, v]) => v !== undefined));
  return { ...defaults, ...user, notifications: { ...defaults.notifications, ...user.notifications } };
}
module.exports = { mergeSettings };
