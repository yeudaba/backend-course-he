async function loadDashboard(sources) {
  const names = Object.keys(sources);
  const rs = await Promise.allSettled(names.map((n) => sources[n]()));
  const data = {}, errors = {};
  rs.forEach((r, i) => (r.status === "fulfilled" ? (data[names[i]] = r.value) : (errors[names[i]] = r.reason.message)));
  return { data, errors };
}
module.exports = { loadDashboard };
