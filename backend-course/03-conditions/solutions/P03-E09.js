const savedUsername = "dana";
const savedPassword = "s3cret!Pass";
const isBlocked = false;
const typedUsername = "  Dana ";
const typedPassword = "s3cret!Pass";

const usernameOk = typedUsername.trim().toLowerCase() === savedUsername;
const passwordOk = typedPassword === savedPassword;

if (isBlocked) {
  console.log("החשבון חסום");
} else if (usernameOk && passwordOk) {
  console.log("כניסה הצליחה");
} else {
  console.log("שם משתמש או סיסמה שגויים");
}
