// עוזר לבדיקות סטטיות של Dockerfile (בלי לבנות): קורא את הקובץ שלך ומפרק להוראות
import path from "node:path";
import assert from "node:assert/strict";
import { target } from "../../tools/load.mjs";
import { parseDockerfile, readText } from "../../tools/docker.mjs";

export function steps(testUrl, dir) {
  const s = parseDockerfile(readText(target(testUrl, path.join(dir, "Dockerfile"))));
  assert.ok(s.length > 0, `ה־Dockerfile ב־${dir} ריק — כתוב בו את ההוראות`);
  return s;
}
// האינדקס של ההוראה הראשונה שמתאימה (או -1)
export const find = (s, cmd, re = /./) => s.findIndex((x) => x.cmd === cmd && re.test(x.args));
