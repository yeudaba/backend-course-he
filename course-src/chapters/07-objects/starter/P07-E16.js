// P07-E16: מיזוג הגדרות
// defaults = { theme: "light", language: "he", notifications: { email: true, sms: false } }
// mergeSettings(defaults, { theme: "dark", language: undefined, notifications: { sms: true } })
//   → { theme: "dark", language: "he", notifications: { email: true, sms: true } }
function mergeSettings(defaults, userSettings = {}) {
  // כתוב כאן
}

module.exports = { mergeSettings };
