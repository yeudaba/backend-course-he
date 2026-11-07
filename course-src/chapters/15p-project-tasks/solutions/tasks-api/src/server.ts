import { createApp } from "./app.ts";

const port = Number(process.env.PORT ?? 3000);
createApp({ log: console.log, corsOrigins: process.env.CORS_ORIGINS?.split(",") }).listen(port, () => {
  console.log(`tasks-api רץ: http://localhost:${port}`);
});
