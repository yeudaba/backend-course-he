// P15.5-E32: HTML או JSON מאותו route
import express from "express";

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export function createApp(products) {
  const app = express();
  app.get("/products", (req, res) => {
    if (!(req.get("accept") ?? "").includes("text/html")) {
      res.json(products);
      return;
    }
    const list = products.length
      ? `<ul>${products.map((p) => `<li>${esc(p.name)} — ₪${p.price.toFixed(2)}</li>`).join("")}</ul>`
      : "<p>אין מוצרים</p>";
    res.type("html").send(`<!doctype html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"><title>מוצרים</title></head>
<body><h1>מוצרים</h1>${list}</body>
</html>`);
  });
  return app;
}

const server = createApp([{ id: 1, name: "מקלדת <RGB>", price: 249 }]).listen(0, async () => {
  const base = `http://localhost:${server.address().port}/products`;
  const html = await fetch(base, { headers: { Accept: "text/html" } });
  console.log(html.headers.get("content-type"));
  console.log((await html.text()).match(/<ul>.*<\/ul>/)[0]);
  console.log(await (await fetch(base)).text());
  server.close();
});
