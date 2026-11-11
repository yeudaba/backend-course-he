function parseFrame(line) {
  const text = line.trim().slice(3);
  let fn = null;
  let location = text;
  if (text.endsWith(")")) {
    const open = text.indexOf(" (");
    fn = text.slice(0, open);
    location = text.slice(open + 2, -1);
  }
  const lastColon = location.lastIndexOf(":");
  const prevColon = location.lastIndexOf(":", lastColon - 1);
  const lineNo = Number(location.slice(prevColon + 1, lastColon));
  const colNo = Number(location.slice(lastColon + 1));
  if (lastColon === -1 || prevColon === -1 || Number.isNaN(lineNo) || Number.isNaN(colNo)) {
    return { fn, file: location, line: null, col: null };
  }
  return { fn, file: location.slice(0, prevColon), line: lineNo, col: colNo };
}

console.log(parseFrame("    at lineTotal (/p/lines.js:2:15)"));
console.log(parseFrame("    at Array.map (<anonymous>)"));

module.exports = { parseFrame };
