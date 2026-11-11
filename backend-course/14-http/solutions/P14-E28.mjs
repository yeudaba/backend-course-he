// P14-E28: לחכות שהשרת יעלה
import http from "node:http";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function waitUntilReady(url, { tries = 10, delayMs = 100 } = {}) {
  let attempt = 0;
  while (attempt < tries) {
    attempt++;
    try {
      const res = await fetch(url);
      if (res.ok) {
        return attempt;
      }
    } catch {
      // השרת עוד לא מקשיב — ננסה שוב
    }
    if (attempt < tries) {
      await sleep(delayMs);
    }
  }
  throw new Error(`השרת לא מוכן אחרי ${tries} ניסיונות`);
}

// שרת שעונה 503 בשתי הבקשות הראשונות, ואז 200
let calls = 0;
const server = http.createServer((req, res) => {
  calls++;
  res.writeHead(calls <= 2 ? 503 : 200).end();
});
server.listen(0, async () => {
  const url = `http://localhost:${server.address().port}/health`;
  console.log("מוכן בניסיון", await waitUntilReady(url, { delayMs: 20 }));
  try {
    await waitUntilReady("http://localhost:1/health", { tries: 3, delayMs: 20 });
  } catch (err) {
    console.log(err.message);
  }
  server.close();
});
