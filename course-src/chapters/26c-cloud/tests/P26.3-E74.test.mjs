import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { renderTemplate } = await load(import.meta.url, "P26.3-E74.ts");
const ctx = (values) => ({ Values: values, Release: { Name: "coffee" }, Chart: { AppVersion: "1.4.2" } });

test("נתיבים ו־default", () => {
  const tpl = 'replicas: {{ .Values.replicas }}\nimage: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"\napp: {{.Release.Name}}';
  assert.equal(renderTemplate(tpl, ctx({ replicas: 3, image: { repository: "ghcr.io/x/coffee", tag: "" } })), 'replicas: 3\nimage: "ghcr.io/x/coffee:1.4.2"\napp: coffee');
  assert.equal(renderTemplate(tpl, ctx({ replicas: 1, image: { repository: "r", tag: "1.5.0" } })), 'replicas: 1\nimage: "r:1.5.0"\napp: coffee');
});
test("default עם מחרוזת ומספר, ‏quote, וחסר", () => {
  const c = ctx({ zero: 0, f: false, s: "x", host: 'a"b' });
  assert.equal(renderTemplate('{{ .Values.missing | default "info" }}', c), "info");
  assert.equal(renderTemplate("{{ .Values.zero | default 7 }}", c), "7");
  assert.equal(renderTemplate("{{ .Values.f | default 1 }}", c), "1");
  assert.equal(renderTemplate('{{ .Values.s | default "y" }}', c), "x");
  assert.equal(renderTemplate("[{{ .Values.missing }}] [{{ .Values.a.b.c }}]", c), "[] []");
  assert.equal(renderTemplate("{{ .Values.s | quote }} {{ .Values.host | quote }}", c), '"x" "a\\"b"');
  assert.equal(renderTemplate('{{ .Values.missing | default "w" | quote }}', c), '"w"');
});
test("אובייקט ← שגיאה", () => {
  assert.throws(() => renderTemplate("{{ .Values.image }}", ctx({ image: { tag: "1" } })));
  assert.throws(() => renderTemplate("{{ .Values.list }}", ctx({ list: [1] })));
});
