function ownFrames(stack, projectDir) {
  const result = [];
  for (const raw of stack.split("\n")) {
    const text = raw.trim();
    if (!text.startsWith("at ")) {
      continue;
    }
    const location = text.endsWith(")") ? text.slice(text.lastIndexOf("(") + 1, -1) : text.slice(3);
    const lastColon = location.lastIndexOf(":");
    const prevColon = location.lastIndexOf(":", lastColon - 1);
    const file = location.slice(0, prevColon);
    if (!file.startsWith(projectDir + "/") || file.includes("/node_modules/")) {
      continue;
    }
    result.push(`${file.slice(projectDir.length + 1)}:${location.slice(prevColon + 1, lastColon)}`);
  }
  return result;
}

const stack = `TypeError: x
    at lineTotal (/home/dana/shop/src/lines.js:2:15)
    at Array.reduce (<anonymous>)
    at /home/dana/shop/src/orders.js:4:50
    at handle (/home/dana/shop/node_modules/express/lib/router.js:120:7)
    at Module._compile (node:internal/modules/cjs/loader:1554:14)`;
console.log(ownFrames(stack, "/home/dana/shop"));

module.exports = { ownFrames };
