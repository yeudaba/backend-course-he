async function loadDashboard(sources) {
  const data = {};
  const errors = {};
  for (const name of Object.keys(sources)) {
    try {
      data[name] = await sources[name]();
    } catch (reason) {
      errors[name] = reason?.message ?? String(reason);
    }
  }
  return { data, errors };
}
module.exports = { loadDashboard };
