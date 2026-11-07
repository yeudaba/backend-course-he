// עוזר לבדיקות של NestJS (פרק 20). Nest משתמש ב־decorators, ש־Node לא יודע להריץ ישירות מ־.ts —
// לכן כל קובץ תרגיל מתקמפל עם tsc ל־.build/ (רק אם השתנה), ונטען משם.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { target, api } from "./load.mjs";

const require = createRequire(import.meta.url);

export function loadNest(testUrl, file) {
  const src = target(testUrl, file);
  if (!fs.existsSync(src)) throw new Error(`לא נמצא ${src}`);
  const chapterDir = path.join(path.dirname(fileURLToPath(testUrl)), "..");
  const name = path.basename(file, ".ts");
  const outDir = path.join(chapterDir, ".build", process.env.CHECK_TARGET || "starter", name);
  const out = path.join(outDir, `${name}.js`);
  if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < fs.statSync(src).mtimeMs) {
    fs.rmSync(outDir, { recursive: true, force: true });
    const root = path.resolve(chapterDir, "..");
    const tsc = process.env.TSC_PATH || path.join(root, "node_modules", "typescript", "bin", "tsc");
    const args = [tsc, src, "--outDir", outDir, "--rootDir", path.dirname(src), "--experimentalDecorators", "--emitDecoratorMetadata",
      "--module", "commonjs", "--target", "es2022", "--esModuleInterop", "--skipLibCheck", "--strict", "--strictPropertyInitialization", "false",
      "--types", "node", "--pretty", "false"];
    const r = spawnSync(process.execPath, args, { encoding: "utf8" });
    if (!fs.existsSync(out)) throw new Error(`הקומפילציה של ${file} נכשלה:\n${r.stdout}${r.stderr}`);
  }
  require("reflect-metadata");
  return require(out);
}

// מפעיל אפליקציית Nest על פורט פנוי. overrides: [[token, value], ...] — החלפת providers (למשל שעון או repository)
export async function nestApp(t, moduleClass, { validation = false, overrides = [], setup } = {}) {
  const { Test } = require("@nestjs/testing");
  let builder = Test.createTestingModule({ imports: [moduleClass] });
  for (const [token, value] of overrides) builder = builder.overrideProvider(token).useValue(value);
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication({ logger: false });
  if (validation) {
    const { ValidationPipe } = require("@nestjs/common");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  }
  if (setup) await setup(app);
  await app.init();
  const server = app.getHttpServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    server.closeAllConnections?.();
    await app.close();
  });
  return { app, moduleRef, call: api(`http://127.0.0.1:${server.address().port}`) };
}
