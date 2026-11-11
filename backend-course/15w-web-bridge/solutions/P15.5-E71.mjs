// P15.5-E71: תיבת שגיאה עם details
export function showError(doc, box, error) {
  const p = doc.createElement("p");
  p.textContent = error.message;
  const parts = [p];
  if (error.details?.length) {
    const ul = doc.createElement("ul");
    for (const d of error.details) {
      const li = doc.createElement("li");
      li.textContent = `${d.path}: ${d.message}`;
      ul.append(li);
    }
    parts.push(ul);
  }
  box.replaceChildren(...parts);
  box.hidden = false;
}

export function clearError(box) {
  box.replaceChildren();
  box.hidden = true;
}
