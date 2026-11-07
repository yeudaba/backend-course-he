const start = 1001;
const limit = 100000;
let found = null;
let checks = 0;

for (let n = start; n <= limit; n++) {
  checks++;
  if (n % 7 === 0 && n % 13 === 0) {
    found = n;
    break;
  }
}

if (found === null) {
  console.log("לא נמצא עד הגבול");
} else {
  console.log(`נמצא: ${found} אחרי ${checks} בדיקות`);
}
