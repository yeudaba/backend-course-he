// P15.5-E57: מונה עם כפתורים
export function bindCounter(doc, { max = 10 } = {}) {
  const dec = doc.querySelector("#dec");
  const inc = doc.querySelector("#inc");
  const out = doc.querySelector("#count");
  let value = 0;

  function render() {
    out.textContent = String(value);
    dec.disabled = value === 0;
    inc.disabled = value === max;
  }

  inc.addEventListener("click", () => {
    if (value < max) value++;
    render();
  });
  dec.addEventListener("click", () => {
    if (value > 0) value--;
    render();
  });
  render();
  return () => value;
}
