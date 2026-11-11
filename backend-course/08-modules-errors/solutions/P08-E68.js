function explainError(err) {
  const msg = err.message;
  switch (err.name) {
    case "TypeError": {
      const prefix = "Cannot read properties of ";
      if (msg.startsWith(prefix)) {
        const value = msg.slice(prefix.length, msg.indexOf(" ("));
        const field = msg.slice(msg.indexOf("'") + 1, msg.lastIndexOf("'"));
        return `ניסית לקרוא את "${field}" מתוך ${value} — מה שמשמאל לנקודה ריק`;
      }
      const notFn = " is not a function";
      if (msg.endsWith(notFn)) {
        return `"${msg.slice(0, -notFn.length)}" הוא לא פונקציה — בדוק את השם ואת הייבוא`;
      }
      break;
    }
    case "ReferenceError": {
      const notDefined = " is not defined";
      if (msg.endsWith(notDefined)) {
        return `"${msg.slice(0, -notDefined.length)}" לא מוגדר — שגיאת כתיב, או שחסר ייבוא?`;
      }
      break;
    }
    case "SyntaxError":
      return `טקסט לא תקין: ${msg}`;
  }
  return `${err.name}: ${msg}`;
}

try {
  null.price;
} catch (err) {
  console.log(explainError(err));
}

module.exports = { explainError };
