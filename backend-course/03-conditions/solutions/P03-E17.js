const username = "dana1234";
const password = "long!password1";

const lower = password.toLowerCase();
const hasSpecial = password.includes("!") || password.includes("@") || password.includes("#");

if (password === "") {
  console.log("חובה להזין סיסמה");
} else if (password.length < 8) {
  console.log("לפחות 8 תווים");
} else if (lower === username.toLowerCase()) {
  console.log("הסיסמה לא יכולה להיות שם המשתמש");
} else if (lower === "12345678" || lower === "password" || lower === "qwertyui") {
  console.log("סיסמה נפוצה מדי");
} else if (!hasSpecial) {
  console.log("חייב תו מיוחד: ! @ #");
} else {
  console.log("סיסמה תקינה");
}
