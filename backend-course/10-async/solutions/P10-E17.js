// P10-E17
async function loadDashboard(sources) {
  const names = Object.keys(sources);
  const results = await Promise.allSettled(names.map((name) => sources[name]()));
  const data = {};
  const errors = {};
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      data[names[i]] = result.value;
    } else {
      errors[names[i]] = result.reason?.message ?? String(result.reason);
    }
  });
  return { data, errors };
}

loadDashboard({
  user: async () => ({ name: "דנה" }),
  weather: async () => {
    throw new Error("השירות לא זמין");
  },
  cart: async () => 3,
}).then(console.log);

module.exports = { loadDashboard };
