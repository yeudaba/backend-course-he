// P10-E84: "טוען..." נדלק ונכבה תמיד
function withLoading(task, setLoading) {
  setLoading(true);
  return task().finally(() => setLoading(false));
}

const show = (on) => console.log(on ? "טוען..." : "סיימנו");
withLoading(() => Promise.resolve(42), show)
  .then((v) => console.log("קיבלנו", v))
  .then(() => withLoading(() => Promise.reject(new Error("השרת לא עונה")), show))
  .catch((err) => console.log("נכשל:", err.message));

module.exports = { withLoading };
