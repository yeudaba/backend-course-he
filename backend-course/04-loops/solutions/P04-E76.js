const email = "dana@mail.com";
const at = email.indexOf("@");
let masked = "";
for (let i = 0; i < email.length; i++) {
  if (i === 0 || i >= at) {
    masked += email[i];
  } else {
    masked += "*";
  }
}
console.log(masked);
