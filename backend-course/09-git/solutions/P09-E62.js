function resolve(text, choice) {
  const out = [];
  let state = "out";
  let ours = [];
  let theirs = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("<<<<<<<")) {
      state = "ours";
    } else if (line === "=======" && state === "ours") {
      state = "theirs";
    } else if (line.startsWith(">>>>>>>") && state === "theirs") {
      if (choice === "ours" || choice === "both") {
        out.push(...ours);
      }
      if (choice === "theirs" || choice === "both") {
        out.push(...theirs);
      }
      ours = [];
      theirs = [];
      state = "out";
    } else if (state === "ours") {
      ours.push(line);
    } else if (state === "theirs") {
      theirs.push(line);
    } else {
      out.push(line);
    }
  }
  return out.join("\n");
}

const text = ["<<<<<<< HEAD", "a", "=======", "b", ">>>>>>> x", "end"].join("\n");
console.log(resolve(text, "both"));

module.exports = { resolve };
