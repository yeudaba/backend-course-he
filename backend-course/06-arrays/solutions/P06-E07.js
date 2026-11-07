// P06-E07: תור
function joinQueue(queue, name) {
  return queue.push(name);
}

function serveNext(queue) {
  if (queue.length === 0) {
    return null;
  }
  return queue.shift();
}

function vipJoin(queue, name) {
  queue.unshift(name);
}

const q = [];
joinQueue(q, "דנה");
console.log(joinQueue(q, "עומר"));
vipJoin(q, "VIP");
console.log(serveNext(q), q);

module.exports = { joinQueue, serveNext, vipJoin };
