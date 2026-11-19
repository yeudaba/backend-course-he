const DURATION = /^(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?$/;

function parseDuration(text) {
  const m = text.trim().match(DURATION);
  if (m === null) {
    return null;
  }
  const [, h, min, s] = m;
  if (h === undefined && min === undefined && s === undefined) {
    return null;
  }
  return Number(h ?? 0) * 3600 + Number(min ?? 0) * 60 + Number(s ?? 0);
}

for (const input of ["1h 30m", "1h30m15s", "90s", " 10m ", "30m 1h", "1.5h", ""]) {
  console.log(JSON.stringify(input), parseDuration(input));
}

module.exports = { parseDuration };
