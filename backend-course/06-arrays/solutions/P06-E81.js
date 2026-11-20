// P06-E81: התור בקופה — מתוקן
function serveNext(queue) {
  if (queue.length === 0) return null;
  return queue.shift();
}

function lastInLine(queue) {
  if (queue.length === 0) return null;
  return queue[queue.length - 1];
}

function addVip(queue, name) {
  return queue.unshift(name);
}

const queue = ["דנה", "עומר", "נועה"];
console.log(serveNext(queue), queue);
console.log(lastInLine(queue), queue);
console.log(addVip(queue, "גיל"), queue);
console.log(serveNext([]), lastInLine([]));

module.exports = { serveNext, lastInLine, addVip };
