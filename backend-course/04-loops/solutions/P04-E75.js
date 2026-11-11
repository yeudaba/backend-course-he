const text = "mississippi";
const letter = "s";
let count = 0;
for (const ch of text) {
  if (ch === letter) {
    count++;
  }
}
console.log(`${letter} מופיעה ${count} פעמים`);
