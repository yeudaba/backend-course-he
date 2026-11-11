function formatDuration(seconds, showSeconds = true) {
  const hours = Math.floor(seconds / 3600);
  const minutes = `${Math.floor((seconds % 3600) / 60)}`.padStart(2, "0");
  const secs = `${seconds % 60}`.padStart(2, "0");
  if (!showSeconds) {
    return `${hours}:${minutes}`;
  }
  return `${hours}:${minutes}:${secs}`;
}

console.log(formatDuration(3725), formatDuration(3725, false));

module.exports = { formatDuration };
