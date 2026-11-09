// עוזר לבדיקות של יחידה 26.3: קורא Jenkinsfile (declarative pipeline) לעץ של בלוקים —
// pipeline { agent … stages { stage('Test') { steps { sh 'npm test' } } } post { … } }
// לא מריץ Groovy: רק מבנה, כמו "Pipeline Linter" של Jenkins לחלקים שהתרגילים צריכים.
import fs from "node:fs";
import assert from "node:assert/strict";
import { target } from "../../tools/load.mjs";

export function parseJenkinsfile(text) {
  let i = 0;
  const peek = (s) => text.startsWith(s, i);
  function readString() {
    for (const q of ["'''", '"""', "'", '"']) {
      if (!peek(q)) continue;
      const start = i;
      i += q.length;
      while (i < text.length && !peek(q)) i += text[i] === "\\" ? 2 : 1;
      i += q.length;
      return text.slice(start, i);
    }
    return null;
  }
  function parseBody() {
    const node = { children: [], stmts: [] };
    let head = "";
    let parens = 0;
    const flush = () => {
      const s = head.trim();
      if (s) node.stmts.push(s);
      head = "";
    };
    while (i < text.length) {
      if (peek("//")) { while (i < text.length && text[i] !== "\n") i++; continue; }
      if (peek("/*")) { const e = text.indexOf("*/", i); i = e < 0 ? text.length : e + 2; continue; }
      const str = readString();
      if (str !== null) { head += str; continue; }
      const c = text[i];
      if (c === "(" || c === "[") parens++;
      if (c === ")" || c === "]") parens--;
      if (c === "{" && parens === 0) {
        i++;
        const h = head.trim();
        head = "";
        const m = /^([A-Za-z_][\w]*)\s*(?:\(([\s\S]*)\))?$/.exec(h);
        const child = parseBody();
        child.head = h;
        child.name = m ? m[1] : h;
        child.args = m?.[2]?.trim() ?? "";
        node.children.push(child);
        continue;
      }
      if (c === "}" && parens === 0) { flush(); i++; return node; }
      if (c === "\n" && parens === 0) { flush(); i++; continue; }
      head += c;
      i++;
    }
    flush();
    return node;
  }
  return parseBody();
}

export function readJenkinsfile(testUrl, file) {
  const text = fs.readFileSync(target(testUrl, file), "utf8");
  const root = parseJenkinsfile(text);
  const pipeline = root.children.find((c) => c.name === "pipeline");
  assert.ok(pipeline, "אין בלוק pipeline { … } — declarative pipeline מתחיל בו");
  return { text, pipeline };
}

export const child = (node, name) => node?.children.find((c) => c.name === name);
export const unquote = (s = "") => s.trim().replace(/^(['"]{1,3})([\s\S]*)\1$/, "$2");

export function stages(pipeline) {
  const st = child(pipeline, "stages");
  assert.ok(st, "אין stages { … }");
  return st.children.filter((c) => c.name === "stage").map((s) => ({ name: unquote(s.args), node: s }));
}
export function stage(pipeline, re) {
  return stages(pipeline).find((s) => re.test(s.name));
}
// כל השורות (steps) בתוך בלוק, כולל בלוקים פנימיים (withCredentials, script…)
export function allStmts(node) {
  return [...node.stmts, ...node.children.flatMap((c) => [c.head, ...allStmts(c)])];
}
export const stageIndex = (pipeline, re) => stages(pipeline).findIndex((s) => re.test(s.name));
