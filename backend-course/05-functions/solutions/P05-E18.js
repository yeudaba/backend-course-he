// P05-E18: ציון חוזק סיסמה
function hasMatching(text, predicate) {
  for (const ch of text) {
    if (predicate(ch)) {
      return true;
    }
  }
  return false;
}

const hasDigit = (text) => hasMatching(text, (ch) => "0123456789".includes(ch));
const hasUpper = (text) => hasMatching(text, (ch) => ch !== ch.toLowerCase());
const hasSpecial = (text) => hasMatching(text, (ch) => "!@#$%".includes(ch));

function passwordScore(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (hasDigit(password)) score++;
  if (hasUpper(password)) score++;
  if (hasSpecial(password)) score++;
  return score;
}

function passwordLabel(password) {
  const score = passwordScore(password);
  if (score <= 1) {
    return "חלשה";
  }
  if (score <= 3) {
    return "בינונית";
  }
  return "חזקה";
}

console.log(passwordScore("abc"), passwordLabel("Secret123"), passwordLabel("Secret123!"));

module.exports = { hasDigit, hasUpper, hasSpecial, passwordScore, passwordLabel };
