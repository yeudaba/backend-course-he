// P10-E34: הודעות במרווחים
function logInOrder(messages, gap, log) {
  for (let i = 0; i < messages.length; i++) {
    setTimeout(() => log(messages[i]), i * gap);
  }
}

logInOrder(["שלוש", "שתיים", "אחת"], 20, console.log);
console.log("מתחילים");

module.exports = { logInOrder };
