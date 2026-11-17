const fileSizeBytes = 3500000;
const maxMb = 2;
const sizeMb = fileSizeBytes / 1024 / 1024;
console.log(`גודל: ${sizeMb.toFixed(2)} MB`);
console.log(`מותר: עד ${maxMb} MB`);
console.log(`גדול מדי? ${sizeMb > maxMb}`);
