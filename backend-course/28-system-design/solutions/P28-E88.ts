// P28-E88: כמה כתיבות לפידים?
type User = { id: string; followers: number; postsPerDay: number };

export function fanoutCost(users: User[], threshold: number) {
  let pushAll = 0;
  let hybrid = 0;
  const celebrities: string[] = [];
  for (const u of users) {
    const writes = u.followers * u.postsPerDay;
    pushAll += writes;
    if (u.followers >= threshold) celebrities.push(u.id);
    else hybrid += writes;
  }
  const saved = pushAll === 0 ? 0 : Math.round(((pushAll - hybrid) / pushAll) * 100);
  return { pushAll, hybrid, celebrities, saved };
}
