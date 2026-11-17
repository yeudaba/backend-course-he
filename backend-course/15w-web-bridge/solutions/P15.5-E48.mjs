// P15.5-E48: hex ל־rgb ובחזרה
export function hexToRgb(hex) {
  if (typeof hex !== "string" || !/^#([0-9a-f]{3}){1,2}$/i.test(hex)) throw new Error(`צבע לא תקין: ${hex}`);
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

export function rgbToHex({ r, g, b }) {
  const two = (n) => {
    if (!Number.isInteger(n) || n < 0 || n > 255) throw new Error("ערך rgb לא תקין");
    return n.toString(16).padStart(2, "0");
  };
  return `#${two(r)}${two(g)}${two(b)}`;
}

console.log(hexToRgb("#d8dbe0"), hexToRgb("#FA0"));
console.log(rgbToHex({ r: 9, g: 105, b: 218 }), rgbToHex(hexToRgb("#ABC")));
for (const bad of ["#abcd", "red"]) {
  try {
    hexToRgb(bad);
  } catch (err) {
    console.log(err.message);
  }
}
