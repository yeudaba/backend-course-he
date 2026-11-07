const isOnline = true;
const isExpress = false;
const count = 3;

const status = isOnline ? "מחובר" : "לא מחובר";
const fee = isExpress ? 40 : 20;
const word = count === 1 ? "הודעה" : "הודעות";

console.log(`${status} | משלוח ${fee} | ${count} ${word}`);
