import { test } from "node:test";
import assert from "node:assert/strict";
import { target } from "../../tools/load.mjs";
import { readText } from "../../tools/docker.mjs";
import { steps, find } from "./_dockerfile.mjs";

test("Dockerfile", () => {
  const s = steps(import.meta.url, "P23-E93");
  assert.equal(s[0].cmd, "FROM");
  assert.equal(s[0].args, "nginx:1.29-alpine");
  assert.ok(find(s, "COPY", /^nginx\.conf\s+\/etc\/nginx\/conf\.d\/default\.conf$/) !== -1, "COPY nginx.conf /etc/nginx/conf.d/default.conf");
  assert.ok(find(s, "COPY", /^web\/?\s+\/usr\/share\/nginx\/html\/?$/) !== -1, "COPY web/ /usr/share/nginx/html/");
  assert.ok(find(s, "EXPOSE", /^80$/) !== -1, "EXPOSE 80");
  const hc = s.find((x) => x.cmd === "HEALTHCHECK");
  assert.ok(hc && /wget/.test(hc.args) && /http:\/\/127\.0\.0\.1\/?(\s|$)/.test(hc.args), "HEALTHCHECK עם wget ל־http://127.0.0.1/");
  assert.equal(find(s, "CMD"), -1, "בלי CMD — של nginx");
});
test("nginx.conf", () => {
  const conf = readText(target(import.meta.url, "P23-E93/nginx.conf")).replace(/#.*$/gm, "");
  assert.match(conf, /server\s*\{/, "בלוק server");
  assert.match(conf, /listen\s+80\s*;/);
  assert.match(conf, /root\s+\/usr\/share\/nginx\/html\/?\s*;/);
  assert.match(conf, /location\s+\/\s*\{[^}]*try_files\s+\$uri\s+\/index\.html\s*;[^}]*\}/, "location / עם try_files $uri /index.html;");
  assert.match(conf, /location\s+\/api\/\s*\{[^}]*proxy_pass\s+http:\/\/api:3000\/\s*;[^}]*\}/, "location /api/ עם proxy_pass http://api:3000/; (עם / בסוף)");
  assert.doesNotMatch(conf, /localhost|127\.0\.0\.1/, "בלי localhost — api לפי שם השירות");
});
