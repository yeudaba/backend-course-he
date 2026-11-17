const size = 4;
for (let row = 0; row < size; row++) {
  let line = "";
  for (let col = 0; col < size; col++) {
    line += (row + col) % 2 === 0 ? "#" : ".";
  }
  console.log(line);
}
