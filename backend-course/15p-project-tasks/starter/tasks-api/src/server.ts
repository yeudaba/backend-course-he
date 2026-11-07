import { createApp } from "./app.ts";

const port = Number(process.env.PORT ?? 3000);
createApp({ log: console.log }).listen(port, () => {
  console.log(`tasks-api רץ: http://localhost:${port}`);
});
