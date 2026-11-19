function safeParse(text, fallback = null) { try { return JSON.parse(text) || fallback; } catch { return fallback; } }
function parseOrThrow(text) { try { return JSON.parse(text); } catch { throw new Error("JSON לא תקין"); } }
module.exports = { safeParse, parseOrThrow };
