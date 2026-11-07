// P14-E21: מתוקן
export async function createProduct(baseUrl, product) {
  const res = await fetch(`${baseUrl}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
    signal: AbortSignal.timeout(5000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${data.error}`);
  return data;
}
