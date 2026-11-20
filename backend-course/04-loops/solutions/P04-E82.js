const limit = 10;
let sum = 0;
let skipped = 0;
for (let i = 1; i <= limit; i++) {
  if (i % 3 === 0) {
    skipped++;
    continue;
  }
  sum += i;
}
console.log(`סכום: ${sum}`);
console.log(`דילגנו על: ${skipped}`);
