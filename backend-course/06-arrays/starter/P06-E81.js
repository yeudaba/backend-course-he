// P06-E81: התור בקופה — בכל פונקציה באג אחד.
// serveNext(queue)     — מוציאה את הראשון ומחזירה את שמו. ריק ← null
// lastInLine(queue)    — מחזירה את האחרון, בלי לשנות. ריק ← null
// addVip(queue, name)  — מוסיפה לתחילת התור, ומחזירה את האורך החדש
//
// הרצה:   node 06-arrays/starter/P06-E81.js
// בדיקה:  npm run check P06-E81
function serveNext(queue) {
  if (queue.length === 0) return null;
  return queue.pop();
}

function lastInLine(queue) {
  if (queue.length === 0) return null;
  return queue[queue.length];
}

function addVip(queue, name) {
  queue[0] = name;
  return queue.length;
}

const queue = ["דנה", "עומר", "נועה"];
console.log(serveNext(queue), queue);
console.log(lastInLine(queue), queue);
console.log(addVip(queue, "גיל"), queue);
console.log(serveNext([]), lastInLine([]));

module.exports = { serveNext, lastInLine, addVip };
