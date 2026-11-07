// הגדרות ESLint של הקורס (פרק 8). מסמן טעויות נפוצות עוד לפני שמריצים.
import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["**/node_modules/**"] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: "latest", globals: { ...globals.node } },
    rules: {
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "warn",
      "no-unused-vars": "warn",
    },
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
];
