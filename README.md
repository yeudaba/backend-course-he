# קורס Backend בעברית — מאפס ועד משרת Junior

קורס **Backend** שלם בעברית ללמידה עצמית: מ"מה זה משתנה" ועד שרת **NestJS** עם **PostgreSQL**, אבטחה, בדיקות, Docker ופריסה, ובסופו פרויקט לתיק העבודות. הקורס נבנה עבור לומד שעובד על **Mac** עם **VS Code**.

> **בקצרה:** 25 פרקים, יחידות ופרויקטים מוכנים (עד פרק 21, כניסה והרשאות) · 537 תרגילים עם רמזים ודף פתרונות נפרד · בודק אוטומטי (`npm run check P16-E06`) · כל דוגמת קוד, פלט והודעת שגיאה בשיעורים נבדקו בהרצה אמיתית.

---

## מה מיוחד בקורס

- **עברית פשוטה**, עם המונחים באנגלית ומילון מושגים שכולל הגייה.
- **לפני כל פרק** יש קופסת 🧰 "לפני שמתחילים": מה להתקין ב־Mac, קישורים רשמיים, ופקודה שבודקת שההתקנה עבדה.
- **איור SVG בכל שיעור**, שמותאם למצב כהה ולכתיבה מימין לשמאל.
- **25 תרגילים בכל פרק**, בחמש רמות:

  | רמה | תרגילים | מה |
  |---|---|---|
  | 1 | E01–E05 | הבנה וקריאת קוד (בלי בודק) |
  | 2 | E06–E12 | כתיבה בסיסית 🤖 |
  | 3 | E13–E19 | שילוב כמה נושאים 🤖 |
  | 4 | E20–E23 | **תיקון באגים**: קובץ ההתחלה מכיל תקלות אמיתיות 🤖 |
  | 5 | E24–E25 | אתגר 🤖 |

- **דף פתרונות נפרד**, שמסביר *למה* הפתרון עובד ומפרט "טעויות נפוצות".
- **בודק אוטומטי בעברית**: `npm run check P20-E14` מריץ בדיקות `node:test` על הקוד של הלומד ומציג ✔/✖ עם "קיבלנו / ציפינו".
- **פרויקטים לתיק העבודות**, ופרויקט אחד "שגדל" לאורך הקורס (ראה בהמשך).

## הסטאק

JavaScript ← TypeScript ← Node.js/npm ← HTTP ← Express 5 + Zod 4 ← HTML/CSS/fetch ← SQL/PostgreSQL 18 ← Prisma 7 ← **NestJS 12** ← אבטחה ← בדיקות ← Docker ← CI ופריסה ← Redis ← אלגוריתמים ← תכנון מערכת ← AI (רשות) ← תיק עבודות.

---

## מה מוכן

| | תיקייה | נושא | בודק |
|---|---|---|---|
| פרק 0 | `00-setup` | הכנה: המחשב, VS Code והרצה ראשונה | — |
| פרקים 1–4 ⚡ | `01`…`04` | ערכים, פעולות, תנאים, לולאות (עם מבחני כניסה למי שזוכר) | — |
| פרקים 5–7 ⚡ | `05`…`07` | פונקציות, מערכים, אובייקטים | ✔ |
| פרק 8 | `08-modules-errors` | modules, שגיאות, debugger, ESLint | ✔ |
| **פרויקט 1** | `08p-project-expenses` | מנהל הוצאות בשורת הפקודה | ✔ |
| פרק 9 | `09-git` | Git ו־GitHub, עם מאגרי תרגול שנוצרים בסקריפט | — |
| פרק 10 | `10-async` | Promises, async/await | ✔ |
| פרק 11 | `11-typescript` | TypeScript בסיסי | ✔ |
| פרק 12 | `12-design` | classes, repositories, DI | ✔ |
| פרק 13 | `13-node-npm` | Node.js ו־npm | ✔ |
| פרק 14 | `14-http` | URL, methods, status, headers, curl, `node:http`, fetch | ✔ |
| פרק 15 | `15-express` | Express 5, middleware, REST, Zod 4 | ✔ |
| **פרויקט 2 — שלב א׳** | `15p-project-tasks` | tasks-api בזיכרון | ✔ |
| יחידה 15.5 | `15w-web-bridge` | HTML, CSS, fetch ו־CORS — דף הדגמה לפרויקט | ✔ |
| פרק 16 | `16-sql` | SQL מהיסוד | ✔ |
| פרק 17 | `17-relations` | FK, JOIN, GROUP BY, CTE, פונקציות חלון | ✔ |
| פרק 18 | `18-consistency` | transactions, race conditions, indexes/EXPLAIN, N+1, keyset pagination | ✔ |
| פרק 19 | `19-prisma` | Prisma 7 ו־migrations, **פרויקט 2 שלב ב׳** (PostgreSQL) | ✔ |
| פרק 20 | `20-nestjs` | modules, DI, DTOs, pipes, guards, interceptors, filters, Swagger, **פרויקט 2 שלב ג׳** | ✔ |
| פרק 21 | `21-auth` | bcrypt, JWT, refresh tokens עם rotation, תפקידים, בעלות על מידע, OWASP, **פרויקט 2 שלב ד׳** | ✔ |

**מה עוד יבוא** (לפי האפיון, `אפיון_קורס_Backend_v2.md`):
- 22 — בדיקות
- 23 — Linux ו־Docker
- 24 — API של מוצר אמיתי
- 25 — CI ופריסה
- 🏗️ **פרויקט 3, פרויקט הדגל:** מערכת הזמנות לחנות ציוד קפה
- 26 — Cache ותורים (Redis)
- 27 — אלגוריתמים וראיונות
- 28 — תכנון מערכת
- 29 — AI ב־Backend
- 30 — תיק עבודות וחיפוש עבודה

### פרויקט 2 — "פרויקט שגדל"
אותו `tasks-api` עובר כמה גלגולים, ובכל אחד מהם **ה־API החיצוני נשאר זהה**. כך הלומד רואה בעצמו למה כדאי לבנות בשכבות:

1. **שלב א׳ (פרק 15):** Express ו־Zod, repository בזיכרון, מבנה שגיאות אחיד, דף הדגמה ב־HTML.
2. **שלב ב׳ (פרק 19):** PostgreSQL דרך Prisma. הסינון, המיון וה־pagination נעשים במסד.
3. **שלב ג׳ (פרק 20):** NestJS, עם אותן סכמות Zod, filter לשגיאות ו־Swagger ב־`/docs`.
4. **שלב ד׳ (פרק 21):** משתמשים, bcrypt, JWT ו־refresh tokens, תפקידים — וכל משתמש רואה רק את המשימות שלו. דף ההדגמה עם כניסה.
5. **בהמשך:** בדיקות (22), Docker (23) ופריסה עם קישור חי (25).

---

## מבנה המאגר

```
.
├── README.md                     ← המסמך הזה
├── HANDOFF_המשך_הפרויקט.md       ← מצב הפרויקט המלא, למי שממשיך לבנות (כולל "גילויים" טכניים)
├── אפיון_קורס_Backend_v2.md      ← האפיון המאושר
├── אפיון_קורס_Backend_מאפס.md    ← גרסה ראשונה של האפיון (היסטורית)
├── אפיון_קורס_CSharp_DotNet_המשך.md ← קורס נפרד, לא חלק מהעבודה כאן
├── backend-course/               ← ★ מה שהלומד מקבל. נבנה אוטומטית (חוץ מ־00-setup)
│   ├── README.html, glossary.html, assets/style.css
│   ├── 00-setup/ … 21-auth/    ← שיעורים, exercises.html, solutions.html, starter/, solutions/, tests/
│   ├── package.json, tsconfig.json, eslint.config.mjs
│   └── tools/                    ← הבודק: check.mjs, load.mjs, sql.mjs, nest.mjs, reporter.mjs
└── course-src/                   ← ★ המקור. כאן עורכים
    ├── build.mjs                 ← בונה את backend-course ומאמת הכול
    ├── lib.mjs                   ← קטעי HTML שחוזרים
    ├── root/                     ← מועתק לשורש backend-course (ה־package.json של הלומד והבודק)
    ├── scripts/                  ← cloud-setup.sh, make-reference-pr2.py
    └── chapters/<slug>/          ← chapter.mjs, lesson-*.html, exercises.txt, starter/, solutions/, tests/, files/
```

**כלל חשוב:** לא עורכים ביד את `backend-course/`, חוץ מפרק 0. עורכים את `course-src/` ומריצים build.

---

## ללומד: איך מתחילים

1. פותחים את `backend-course/README.html` בדפדפן. זה דף הבית, ובו כל הפרקים, מילון המושגים וטבלת התקדמות.
2. מעתיקים את `backend-course` לתיקיית עבודה ומתקינים את התלויות:
   ```bash
   cp -R backend-course ~/dev/backend-course && cd ~/dev/backend-course && npm install
   ```
3. בכל פרק: קופסת 🧰, אחריה השיעורים, ואז התרגילים שבקובצי `starter/`.
4. בודקים פתרון:
   ```bash
   npm run check P16-E06        # תרגיל אחד
   npm run check P16            # כל הפרק
   npm run check PR2 -- --dir ~/dev/tasks-api   # בדיקות הפרויקט על התיקייה שלך
   ```

## למפתח: איך בונים ומאמתים

```bash
cd course-src && npm ci && cd ..
node course-src/build.mjs --verify 20     # בנייה + אימות של פרקים שמתחילים ב־"20"
node course-src/build.mjs --verify        # הכול (כמה דקות)
node course-src/build.mjs --fill 21       # כמו --verify, וממלא פלט אמיתי במקום ```out עם "?"
```

**מה האימות בודק:**
- כל דוגמת `run` בשיעורים רצה (JS, TS או SQL מול PostgreSQL אמיתי), והפלט שלה זהה למה שכתוב בשיעור.
- כל קובץ בדיקה **עובר על הפתרון** ו**נכשל על קובץ ההתחלה**.
- בכל פרק יש בדיוק 25 תרגילים.

**PostgreSQL לאימות** רץ על פורט **5433**, עם משתמש `postgres`, בלי סיסמה, ובאזור הזמן `Asia/Jerusalem`. `build.mjs` מפעיל אותו לבד:
- **ב־Mac:** שרת פרטי שמשתמש בבינאריים של EDB (`/Library/PostgreSQL/18`), עם תיקיית נתונים `course-src/.pgdata`.
- **בענן או בלינוקס:** קונטיינר Docker בשם `course-pg` (`postgres:18`), ו־`psql` 18 שמועתק ממנו. הכנה חד־פעמית:
  ```bash
  bash course-src/scripts/cloud-setup.sh
  ```
- אפשר להצביע על בינאריים אחרים עם `PG_BIN=/path/to/bin`.

**מצב אחרון:** אימות מלא עבר, וכל הפרקים ירוקים.

## טכנולוגיות וגרסאות

Node.js 24 (Node 22 נתמך באימות) · TypeScript · Express 5 · Zod 4 · PostgreSQL 18 · Prisma 7.10 (`@prisma/adapter-pg`) · NestJS 12 · class-validator · @nestjs/swagger · @nestjs/jwt · bcryptjs · `node:test`.

## רישיון ושימוש

חומר לימוד אישי. ראה את `HANDOFF_המשך_הפרויקט.md` לפרטים על המשך הבנייה.
