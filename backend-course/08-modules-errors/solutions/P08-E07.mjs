// P08-E07: ES Modules
const words = (text) => text.trim().split(" ").filter((w) => w !== "");

export function slugify(text) {
  return words(text.toLowerCase()).join("-");
}

export function wordCount(text) {
  return words(text).length;
}

export default function summary(text) {
  return `${wordCount(text)} מילים: ${slugify(text)}`;
}
