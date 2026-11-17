function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function percent(part, total) {
  if (total === 0) {
    return 0;
  }
  return clamp(Math.round((part / total) * 100), 0, 100);
}

function progressBar(part, total, width = 10) {
  const p = percent(part, total);
  const filled = Math.floor((p * width) / 100);
  const bar = "".padEnd(filled, "#").padEnd(width, "-");
  return `[${bar}] ${p}%`;
}

console.log(progressBar(4, 10), progressBar(1, 3), progressBar(12, 10));

module.exports = { clamp, percent, progressBar };
