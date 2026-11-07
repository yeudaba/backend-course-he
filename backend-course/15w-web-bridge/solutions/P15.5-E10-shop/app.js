const API = "http://localhost:4100";
const $ = (s) => document.querySelector(s);
let timer;

function setStatus(text, isError = false) {
  $("#status").textContent = text;
  $("#status").className = isError ? "error" : "";
}

async function search() {
  setStatus("טוען...");
  try {
    const res = await fetch(`${API}/products?q=${encodeURIComponent($("#q").value)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();
    $("#results").replaceChildren(
      ...products.map((p) => {
        const li = document.createElement("li");
        const name = document.createElement("span");
        name.textContent = p.name;
        const price = document.createElement("span");
        price.textContent = `${p.price} ₪`;
        li.append(name, price);
        return li;
      })
    );
    setStatus(products.length === 0 ? "לא נמצאו מוצרים" : "");
  } catch (err) {
    $("#results").replaceChildren();
    setStatus(`החיפוש נכשל: ${err.message}`, true);
  }
}

$("#q").addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(search, 300);
});
search();
