// P10-E60: משימות ברצף בלי פירמידה
function series(tasks, callback) {
  const results = [];
  if (tasks.length === 0) {
    setTimeout(() => callback(null, results), 0);
    return;
  }
  function next(i) {
    if (i === tasks.length) {
      callback(null, results);
      return;
    }
    tasks[i]((err, result) => {
      if (err) {
        callback(err);
        return;
      }
      results.push(result);
      next(i + 1);
    });
  }
  next(0);
}

const log = [];
series([
  (done) => setTimeout(() => { log.push("config"); done(null, "config"); }, 10),
  (done) => setTimeout(() => { log.push("user"); done(null, "user"); }, 5),
], (err, results) => {
  console.log(err, results, log);
  series([
    (done) => done(new Error("אין הגדרות")),
    (done) => done(null, "לא אמור לרוץ"),
  ], (err) => console.log("נכשל:", err.message));
});

module.exports = { series };
