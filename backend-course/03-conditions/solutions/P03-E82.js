const year = 1900;
const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
console.log(`${year} מעוברת? ${isLeap}`);
