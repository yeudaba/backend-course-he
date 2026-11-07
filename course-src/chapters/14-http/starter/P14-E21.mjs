// P14-E21: הלקוח "מצליח" גם כשהשרת מסרב
// צריך: JSON נכון, Error(`HTTP ${status}: ${error}`) על תשובה שאינה 2xx, timeout של 5 שניות
export async function createProduct(baseUrl, product) {
  const res = await fetch(`${baseUrl}/products`, {
    method: "POST",
    body: product,
  });
  return res.json();
}
