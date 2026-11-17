const VAGUE = ["fix", "update", "changes", "wip", "stuff", "asdf"];

function checkMessage(msg) {
  const text = msg.trim();
  if (text === "") {
    return ["הודעה ריקה"];
  }
  const problems = [];
  if (VAGUE.includes(text.toLowerCase())) {
    problems.push("לא אומרת מה השתנה");
  }
  if (text.length > 50) {
    problems.push("ארוכה מ־50 תווים");
  }
  if (text[0] >= "a" && text[0] <= "z") {
    problems.push("מתחילה באות קטנה");
  }
  if (text.endsWith(".")) {
    problems.push("נגמרת בנקודה");
  }
  return problems;
}

console.log(checkMessage("fixed the bug."), checkMessage("WIP"));

module.exports = { checkMessage };
