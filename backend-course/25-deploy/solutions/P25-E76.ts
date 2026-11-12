// P25-E76: uptime monitor — מתי להעיר?
export function uptimeEvents(checks: { at: string; ok: boolean }[], failuresToAlert = 3) {
  const events: { at: string; type: "DOWN" | "UP" }[] = [];
  let downMs = 0;
  let streak = 0;
  let streakStart = "";
  let down = false;
  for (const { at, ok } of checks) {
    if (ok) {
      if (down) {
        events.push({ at, type: "UP" });
        downMs += Date.parse(at) - Date.parse(streakStart);
      }
      streak = 0;
      down = false;
      continue;
    }
    if (streak === 0) streakStart = at;
    streak++;
    if (streak === failuresToAlert) {
      events.push({ at, type: "DOWN" });
      down = true;
    }
  }
  if (down) downMs += Date.parse(checks[checks.length - 1].at) - Date.parse(streakStart);
  return { events, downMs };
}
