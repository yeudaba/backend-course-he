// P08-E09
// safeParse('{"a":1}') → { a: 1 } | safeParse("{oops", {}) → {}
function safeParse(text, fallback = null) {
  // כתוב כאן
}

// כמו JSON.parse, אבל בשגיאה זורקת Error("JSON לא תקין")
function parseOrThrow(text) {
  // כתוב כאן
}

module.exports = { safeParse, parseOrThrow };
