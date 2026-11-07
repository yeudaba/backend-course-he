// P10-E23: איטי (~300ms) וכשל בהמלצות מפיל הכול.
// דרישות: פחות מ־150ms; כשל ב־getRecommendations → recommendations: []
// מחזירה { name, orderCount, recommendations }
async function getProfilePage(userId, api) {
  const user = await api.getUser(userId);
  const orders = await api.getOrders(userId);
  let recommendations;
  try {
    recommendations = api.getRecommendations(userId);
  } catch {
    recommendations = [];
  }
  return { name: user.name, orderCount: orders.length, recommendations: await recommendations };
}

module.exports = { getProfilePage };
