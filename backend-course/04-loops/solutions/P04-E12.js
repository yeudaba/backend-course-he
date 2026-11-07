const height = 5;
for (let row = 1; row <= height; row++) {
  let line = "";
  for (let s = 0; s < row; s++) {
    line += "*";
  }
  console.log(line);
}
