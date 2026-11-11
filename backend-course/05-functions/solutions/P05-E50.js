function hasDigit(text) {
  for (const ch of text) {
    if (ch >= "0" && ch <= "9") {
      return true;
    }
  }
  return false;
}

function validatePassword(password, username = "") {
  if (password === "") {
    return "חובה להזין סיסמה";
  }
  if (password.length < 8) {
    return "לפחות 8 תווים";
  }
  if (!hasDigit(password)) {
    return "חייבת להכיל ספרה";
  }
  if (username !== "" && password.toLowerCase().includes(username.toLowerCase())) {
    return "הסיסמה לא יכולה להכיל את שם המשתמש";
  }
  return null;
}

console.log(validatePassword("Dana2024!", "dana"));

module.exports = { validatePassword };
