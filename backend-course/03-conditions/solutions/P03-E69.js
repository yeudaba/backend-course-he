const firstName = " dana ";
const nicknameInput = null;
const nickname = (nicknameInput ?? "").trim();
let displayName;
if (nickname !== "") {
  displayName = nickname;
} else {
  const name = firstName.trim();
  displayName = name[0].toUpperCase() + name.slice(1);
}
console.log(`שלום, ${displayName}!`);
