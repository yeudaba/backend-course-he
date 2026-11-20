function withLoading(task, setLoading) {
  setLoading(true);
  return task()
    .then((v) => {
      setLoading(false);
      return v;
    })
    .catch(() => setLoading(false));
}
module.exports = { withLoading };
