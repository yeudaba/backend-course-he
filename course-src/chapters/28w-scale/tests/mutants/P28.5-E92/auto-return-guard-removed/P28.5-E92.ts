// P28.5-E92: שמירת watermark אטומית
import fs from "node:fs/promises";
import path from "node:path";

type Wm = { updatedAt: string; id: number };

export async function saveWatermark(file: string, wm: Wm): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = file + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(wm));
  await fs.rename(tmp, file);
}

export async function loadWatermark(file: string): Promise<Wm | null> {
  let text: string;
  try {
    text = await fs.readFile(file, "utf8");
  } catch (e) {

    throw e;
  }
  const wm = JSON.parse(text);
  if (typeof wm?.updatedAt !== "string" || typeof wm?.id !== "number") throw new Error(`watermark פגום ב־${file}`);
  return { updatedAt: wm.updatedAt, id: wm.id };
}
