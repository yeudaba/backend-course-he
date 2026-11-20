// P10-E83: תזכורות במרווחים — מתוקן
function scheduleReminders(messages, gapMs, log) {
  for (let i = 0; i < messages.length; i++) {
    setTimeout(() => log(messages[i]), i * gapMs);
  }
  setTimeout(() => log("סיימנו"), messages.length * gapMs);
}

scheduleReminders(["לקנות חלב", "להתקשר לסבתא", "לשלם חשבון"], 100, console.log);

module.exports = { scheduleReminders };
