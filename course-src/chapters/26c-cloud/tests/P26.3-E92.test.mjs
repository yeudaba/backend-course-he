import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { findInterpolatedSecrets } = await load(import.meta.url, "P26.3-E92.ts");

test("מוצא בכפולות ובמשולשות כפולות, לא בבודדות ובהערות", () => {
  const jf = [
    "pipeline {",
    "  stages { stage('x') { steps {",
    "    sh 'echo $TOKEN | docker login -u bot --password-stdin'",
    '    sh "curl -H \'Authorization: token ${TOKEN}\' https://api.github.com"',
    "    // sh \"echo $TOKEN\" — הערה",
    '    sh """',
    "      echo hi",
    "      git clone https://bot:${env.GIT_TOKEN}@github.com/x.git",
    '    """',
    "    sh '''echo $GIT_TOKEN'''",
    '    echo "branch ${BRANCH_NAME} and $TOKEN_URL"',
    '    sh "docker login -p $TOKEN ghcr.io"',
    "  } } }",
    "}",
  ].join("\n");
  assert.deepEqual(findInterpolatedSecrets(jf, ["TOKEN", "GIT_TOKEN"]), [
    { line: 4, variable: "TOKEN" },
    { line: 8, variable: "GIT_TOKEN" },
    { line: 12, variable: "TOKEN" },
  ]);
});
test("מרכאת עם backslash לא סוגרת; כמה באותה מחרוזת", () => {
  const jf = 'sh "echo \\"$A\\" and ${B}"\nsh \'a "$A"\'';
  assert.deepEqual(findInterpolatedSecrets(jf, ["A", "B"]), [{ line: 1, variable: "A" }, { line: 1, variable: "B" }]);
  assert.deepEqual(findInterpolatedSecrets("sh 'ok'", ["A"]), []);
});
