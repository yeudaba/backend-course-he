function serve(queue, count = 1) {
  const served = [];
  while (served.length < count && queue.length > 0) {
    served.push(queue.shift());
  }
  return served;
}

const queue = ["דנה", "עומר", "נועה", "יוסי"];
console.log(serve(queue, 2), serve(queue), serve(queue, 5), serve(queue, 3));

module.exports = { serve };
