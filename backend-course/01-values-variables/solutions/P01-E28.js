const startLives = 3;
const coinPoints = 10;
const diamondPoints = 50;

let lives = startLives;
let points = 0;

points = points + coinPoints;
console.log("מטבע | חיים:", lives, "| נקודות:", points);

lives = lives - 1;
console.log("פגיעה | חיים:", lives, "| נקודות:", points);

points = points + coinPoints;
console.log("מטבע | חיים:", lives, "| נקודות:", points);

points = points + diamondPoints;
console.log("יהלום | חיים:", lives, "| נקודות:", points);

console.log("סיום:", lives, "חיים,", points, "נקודות");
