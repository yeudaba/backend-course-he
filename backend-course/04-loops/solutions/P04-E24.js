const size = 4;

for (let i = 1; i <= 2 * size - 1; i++) {
  const row = size - Math.abs(size - i);
  let line = "";
  for (let s = 0; s < size - row; s++) {
    line += " ";
  }
  for (let s = 0; s < 2 * row - 1; s++) {
    line += "*";
  }
  console.log(line);
}
