// P15.5-E49: יחס ניגודיות
function rgb(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

export function luminance(hex) {
  const [R, G, B] = rgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrast(hex1, hex2) {
  const a = luminance(hex1);
  const b = luminance(hex2);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  return Math.round(ratio * 100) / 100;
}

export function readable(fg, bg) {
  return contrast(fg, bg) >= 4.5;
}

for (const [fg, bg] of [["#000", "#fff"], ["#8c959f", "#ffffff"], ["#0969da", "#ffffff"], ["#82071e", "#ffebe9"], ["#fff", "#fff"]]) {
  console.log(fg, bg, contrast(fg, bg), readable(fg, bg));
}
