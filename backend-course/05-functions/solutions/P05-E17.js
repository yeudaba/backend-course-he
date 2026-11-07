// P05-E17: slug וקיצור טקסט
function toSlug(title) {
  const clean = title.trim().toLowerCase();
  let slug = "";
  for (const ch of clean) {
    if (ch === " ") {
      if (slug[slug.length - 1] !== "-") {
        slug += "-";
      }
    } else {
      slug += ch;
    }
  }
  return slug;
}

function truncate(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + "...";
}

console.log(toSlug("  Learn   Node JS  "));
console.log(truncate("Backend development with Node.js", 15));

module.exports = { toSlug, truncate };
