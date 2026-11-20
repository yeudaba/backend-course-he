// פתרון נכון בלי finally: מכבים בשני המסלולים, ובכישלון זורקים את השגיאה שוב
function withLoading(task, setLoading) {
  setLoading(true);
  return task().then(
    (v) => {
      setLoading(false);
      return v;
    },
    (err) => {
      setLoading(false);
      throw err;
    }
  );
}
module.exports = { withLoading };
