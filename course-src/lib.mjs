// קטעי טקסט שחוזרים בכל פרק
export const copyStep = (slug, extra = "") => `<p><strong>📂 העתקת חומרי הפרק:</strong> ב־Finder, העתק את התיקייה <code>${slug}</code> מתוך <code>~/Desktop/Backend/backend-course</code> אל <code>~/dev/backend-course</code> (גרירה עם <kbd>⌥ Option</kbd>).${extra} אם התיקייה כבר שם מהעתקה קודמת ואתה רוצה לשמור את מה שכתבת — בחר <strong>Keep Both</strong> / <strong>Stop</strong> ולא <strong>Replace</strong>.</p>`;

export const verifyNode = `<p><strong>✔ בדיקה שהסביבה מוכנה</strong> — ב־Terminal של VS Code, מתוך <code>~/dev/backend-course</code>:</p>

\`\`\`term
% node -v
v24.11.0
\`\`\`

<p>(כל גרסה 24 ומעלה תקינה.)</p>`;
