// P15.5-E61: כפתור שננעל בזמן שליחה
export function withLock(button, fn) {
  return async (...args) => {
    if (button.disabled) return undefined;
    const label = button.textContent;
    button.disabled = true;
    button.textContent = "שולח...";
    try {
      return await fn(...args);
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  };
}

const button = { disabled: false, textContent: "הוספה" };
const save = withLock(button, async (title) => {
  await new Promise((r) => setTimeout(r, 30));
  if (title === "") throw new Error("כותרת ריקה");
  return { id: 1, title };
});
const first = save("חלב");
console.log(button.disabled, button.textContent, await save("לחם"));
console.log(await first, button.disabled, button.textContent);
await save("").catch((err) => console.log("שגיאה:", err.message, button.disabled, button.textContent));
