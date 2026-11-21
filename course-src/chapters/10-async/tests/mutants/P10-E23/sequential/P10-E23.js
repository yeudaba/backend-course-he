async function getProfilePage(userId, api) {
  const user = await api.getUser(userId);
  const orders = await api.getOrders(userId);
  let recommendations;
  try {
    recommendations = await api.getRecommendations(userId);
  } catch {
    recommendations = [];
  }
  return { name: user.name, orderCount: orders.length, recommendations };
}
module.exports = { getProfilePage };
