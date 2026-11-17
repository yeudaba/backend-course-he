const username = "dana_99";
let badIndex = null;
for (let i = 0; i < username.length; i++) {
  const ch = username[i];
  const isValid = (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9") || ch === "_";
  if (!isValid) {
    badIndex = i;
    break;
  }
}
if (badIndex === null) {
  console.log("שם משתמש תקין");
} else {
  console.log(`תו לא חוקי "${username[badIndex]}" במקום ${badIndex}`);
}
