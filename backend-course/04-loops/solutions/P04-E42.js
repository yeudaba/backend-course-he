const n = 13;
let rest = n;
let bits = "";
while (rest > 0) {
  bits = (rest % 2) + bits;
  rest = Math.floor(rest / 2);
}
if (bits === "") {
  bits = "0";
}
console.log(`${n} בבינארי: ${bits}`);
