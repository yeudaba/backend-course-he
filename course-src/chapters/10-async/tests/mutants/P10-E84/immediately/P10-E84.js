function withLoading(task, setLoading) {
  setLoading(true);
  const p = task();
  setLoading(false);
  return p;
}
module.exports = { withLoading };
