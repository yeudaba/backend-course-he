const HASHTAG = /#([\p{L}\d_]+)/gu;

function extractHashtags(text) {
  const tags = [...text.matchAll(HASHTAG)].map((m) => m[1].toLowerCase());
  return [...new Set(tags)];
}

console.log(extractHashtags("לומד #NodeJS ו־#backend, שוב #nodejs ו־#תכנות_2026"));
console.log(extractHashtags("סתם טקסט"));

module.exports = { extractHashtags };
