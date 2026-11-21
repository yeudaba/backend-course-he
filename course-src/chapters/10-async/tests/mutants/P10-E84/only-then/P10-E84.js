function withLoading(task, setLoading) {
  setLoading(true);
  return task().then((v) => {
    setLoading(false);
    return v;
  });
}
module.exports = { withLoading };
