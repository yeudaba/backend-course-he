// P05-E17: slug וקיצור טקסט
// toSlug("  Learn   Node JS  ") → "learn-node-js"
function toSlug(title) {
  // כתוב כאן
}

// truncate("Backend development", 10) → "Backend..." (אורך כולל בדיוק 10)
function truncate(text, maxLength) {
  // כתוב כאן
}

console.log(toSlug("  Learn   Node JS  "));
console.log(truncate("Backend development with Node.js", 15));

module.exports = { toSlug, truncate };
