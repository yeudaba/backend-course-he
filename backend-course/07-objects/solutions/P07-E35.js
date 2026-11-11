function fieldOr(obj, key, fallback) {
  return obj[key] ?? fallback;
}

const settings = { theme: "dark", fontSize: 0, lang: null };
console.log(fieldOr(settings, "fontSize", 14), fieldOr(settings, "lang", "he"));

module.exports = { fieldOr };
