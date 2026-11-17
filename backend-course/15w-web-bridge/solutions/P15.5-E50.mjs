// P15.5-E50: לכווץ CSS
export function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

const css = `/* כפתורים */
button,
.btn {
  padding: 8px 16px;
  border: none;   /* בלי מסגרת */
}

.card h2 { margin-top: 0; }
button:hover { background: #0550ae; }
`;
console.log(minifyCss(css));
console.log(css.length, "←", minifyCss(css).length, "תווים");
