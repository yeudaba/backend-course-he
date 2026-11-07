// P10-E23: מתוקן
async function getProfilePage(userId, api) {
  const [user, orders, recommendations] = await Promise.all([
    api.getUser(userId),
    api.getOrders(userId),
    api.getRecommendations(userId).catch(() => []),
  ]);
  return { name: user.name, orderCount: orders.length, recommendations };
}

module.exports = { getProfilePage };
