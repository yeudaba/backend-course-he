// P08-E13: שגיאות validation עם מידע נוסף
function validationError(field, message) {
  const err = new Error(message);
  err.field = field;
  err.code = "VALIDATION";
  err.status = 400;
  return err;
}

function validateSignup({ email, password, age }) {
  if (typeof email !== "string" || !email.includes("@")) {
    throw validationError("email", "אימייל לא תקין");
  }
  if (typeof password !== "string" || password.length < 8) {
    throw validationError("password", "סיסמה קצרה מדי");
  }
  if (age !== undefined && (!Number.isInteger(age) || age < 13)) {
    throw validationError("age", "גיל מינימלי 13");
  }
  return true;
}

try {
  validateSignup({ email: "a@b.c", password: "123" });
} catch (err) {
  console.log(err.status, err.field, err.message);
}

module.exports = { validationError, validateSignup };
