// P10-E83: תזכורות במרווחים — "סיימנו" מודפס מיד, ואז הקובץ קורס. שלוש תקלות.
// scheduleReminders(messages, gapMs, log): הודעה i אחרי i × gapMs; "סיימנו" — מרווח אחד אחרי האחרונה.
//
// הרצה:   node 10-async/starter/P10-E83.js
// בדיקה:  npm run check P10-E83
function scheduleReminders(messages, gapMs, log) {
  for (var i = 0; i < messages.length; i++) {
    setTimeout(() => log(messages[i]), gapMs);
  }
  setTimeout(log("סיימנו"), messages.length * gapMs);
}

scheduleReminders(["לקנות חלב", "להתקשר לסבתא", "לשלם חשבון"], 100, console.log);

module.exports = { scheduleReminders };
