# מסמך העברה — קורס Backend בעברית (להמשך בחשבון Claude אחר)

> **ל־Claude שקורא את זה:** זה המצב המלא של הפרויקט נכון ל־7 בנובמבר 2026 (עודכן אחרי המעבר לענן והשלמת פרק 20).
> **מאגר Git:** https://github.com/yeudaba/backend-course-he (ענף `main`). העבודה עברה מהמק לענן (Claude Code on the web). ב־Mac התיקייה היא `/Users/yeuda/Desktop/Backend`; בענן — שורש המאגר.
> קרא את כל המסמך לפני שנוגעים בקוד. אחריו קרא את `אפיון_קורס_Backend_v2.md` (סעיפים 7–14), ואז המשך מהנקודה שבסעיף 7 ("הצעד הבא המיידי"). כל הקבצים נמצאים ב־`/Users/yeuda/Desktop/Backend`.

---

## 1. מי ומה

- **המשתמש:** יהודה (בן הזוג של ויקי). בוגר הנדסת תוכנה, זוכר **מושגים** אבל לא **תחביר**. עובד על **Mac** עם **VS Code** (לא Visual Studio). מדבר עברית.
- **המטרה:** קורס **Backend** שלם בעברית ללמידה עצמית, מאפס ועד רמת תעשייה, כדי להשיג משרת Junior Backend.
- **מה ביקש במפורש:**
  - לפני כל נושא: מה להתקין, עם קישורים (Mac + VS Code).
  - שפה פשוטה, איורים (SVG), והרבה תרגול בין נושא לנושא.
  - **דף פתרונות נפרד**.
  - פרויקטים לתיק העבודות.
- **ההוראה האחרונה שלו:** "תמשיך בבניית הקורס עד שתסיים". לא צריך לשאול אותו שאלות באמצע, רק להמשיך לבנות.
- **הסטאק:** JavaScript ← TypeScript ← Node/npm ← HTTP ← Express ← HTML/CSS/fetch (גישור) ← SQL/PostgreSQL ← Prisma ← NestJS ← אבטחה ← בדיקות ← Docker ← CI/פריסה ← Redis ← אלגוריתמים ← תכנון מערכת ← AI (רשות) ← תיק עבודות.
- **אפיון:** `אפיון_קורס_Backend_v2.md` הוא האפיון המאושר. `אפיון_קורס_Backend_מאפס.md` הוא הגרסה הראשונה (היסטורית).
  - `אפיון_קורס_CSharp_DotNet_המשך.md` הוא קורס **אחר**, לא בתחום העבודה. לא לגעת בו.

---

## 2. מבנה התיקיות

```
/Users/yeuda/Desktop/Backend/
├── HANDOFF_המשך_הפרויקט.md      ← המסמך הזה
├── אפיון_קורס_Backend_v2.md       ← האפיון המאושר
├── backend-course/                ← הפלט שהלומד מקבל (נבנה אוטומטית! לא עורכים ידנית, חוץ מ־00-setup)
│   ├── README.html, glossary.html, assets/style.css
│   ├── 00-setup/                  ← פרק 0 — נכתב ביד, ישירות כאן
│   ├── 01-values-variables/ ...   ← נבנים מ־course-src
│   ├── package.json, tsconfig.json, eslint.config.mjs, tools/   ← מועתקים מ־course-src/root
└── course-src/                    ← המקור. כאן עובדים
    ├── build.mjs                  ← בונה ומאמת הכול
    ├── lib.mjs                    ← copyStep(slug), verifyNode — קטעי HTML שחוזרים
    ├── package.json               ← תלויות לאימות בלבד (typescript, express, zod, pg, prisma, nestjs...)
    ├── node_modules/
    ├── root/                      ← מועתק לשורש backend-course (package.json של הלומד, tools/ של הבודק)
    ├── scripts/make-reference-pr2.py  ← מייצר את reference.html של פרויקט 2 מקובצי הפתרון
    ├── .pgdata/                   ← שרת PostgreSQL פרטי לאימות (ראה סעיף 5). ב־.gitignore
    ├── .run/                      ← זמני (נמחק בסוף כל build)
    └── chapters/<slug>/           ← פרק אחד לכל תיקייה (ממוינים לפי שם!)
```

**הלומד** מעתיק את `backend-course` אל `~/dev/backend-course`, מריץ בה `npm install`, ופותר תרגילים בתיקיות `starter/`. הבודק: `npm run check P15-E07`.

**סדר הפרקים נקבע לפי שם התיקייה (מיון אלפביתי).** לכן `15-express`, `15p-project-tasks` (פרויקט 2), ואז `15w-web-bridge` (יחידה 15.5).

---

## 3. מבנה של פרק (course-src/chapters/<slug>/)

| קובץ/תיקייה | מה |
|---|---|
| `chapter.mjs` | מטא־דאטה (ראה למטה) |
| `lesson-0N-*.html` | גוף השיעור (בלי `<html>`, רק תוכן). מופיע לפי `lessons` ב־chapter.mjs |
| `exercises.txt` | 25 תרגילים, ממנו נבנים `exercises.html` ו־`solutions.html` |
| `starter/` | קובצי התחלה ללומד |
| `solutions/` | קובצי פתרון (חלקם נוצרים אוטומטית מ־`save=` ב־exercises.txt) |
| `tests/` | בדיקות `node:test` (`P16-E06.test.mjs`) |
| `files/` | קבצים נוספים (נתוני דוגמה, שרתי הדגמה, פרויקט Prisma) |

### chapter.mjs — השדות
`num`, `code` (משמש במזהה התרגיל — "16" או "15.5"), `label` (אופציונלי, למשל "פרויקט 2" או "יחידה 15.5"), `title`, `part` (שם החטיבה בדיוק כמו באפיון), `checker: true`, `time`, `expectedExercises: 25`, `install` (HTML של קופסת 🧰), `goals[]`, `intro` (HTML), `lessons[{file,title,minutes,note?}]`, `glossary[[מונח, הגייה, פירוש]]`, `passTest` (HTML).

שדות מיוחדים:
- `fast` — מסלול מהיר (פרקים 1–7).
- `entryTest` — מבחן כניסה.
- `database: true` — מפעיל את שרת ה־PG לאימות.
- `prismaProjects: ["files", "solutions/tasks-api"]` — מריץ `prisma generate` בזמן האימות ומוחק אחר כך.
- `testTimeout` — זמן מקסימלי לקובץ בדיקה באימות (ברירת מחדל 30000; פרק 22: 300000).
- `nestProjects: ["solutions/tasks-api"]` — מריץ `tsc -p tsconfig.build.json` בזמן האימות ומוחק את `dist`.
- `startersPass` — רשימת בדיקות שמותר להן לעבור גם על קובץ ההתחלה.

### exercises.txt — הפורמט
```
@@ P16-E06 | 2 | כותרת 🤖 | 10 | שיעור 2
@task
<p>...</p>
@hint1
<p>...</p>
@hint2
<p>...</p>
@solution
```sql run db=16-sql/files/shop.sql save=solutions/P16-E06.sql
SELECT ...
```
```out
?
```
@mistakes
<ul><li>...</li></ul>
```
- **שורת הכותרת:** `מזהה | רמה | כותרת | דקות | שיעור`. הסימן 🤖 בכותרת מסמן שיש לתרגיל בודק אוטומטי.
- **רמות התרגילים:** E01–05 רמה 1 (הבנה, בלי בודק); E06–12 רמה 2; E13–19 רמה 3; E20–23 רמה 4 (תיקון באג — קובץ ההתחלה מכיל את הבאגים); E24–25 רמה 5 (אתגר).
- **שורת `@type` (אופציונלית, מיד אחרי הכותרת):** `@type warmup` / `scratch` / `review`. התרגיל מקבל תגית (🔥 חימום / ✍️ מאפס / 🔁 חזרה) ומוצג בבלוק "✍️ תרגול כתיבה" בראש דף התרגילים (ובאותו סדר בדף הפתרונות). תרגיל בלי `@type` נבנה בדיוק כמו קודם. ערך לא מוכר — שגיאת בנייה. ראה 7.5.
- **שורות `@lesson N`, ‏`@part 1|2`, ‏`@kind understand` (אופציונליות, אחרי הכותרת):** לאיזה שיעור ולאיזה חלק בדף התרגול של השיעור, והאם זו שאלת הבנה. ראה 7.6.
- כל שיעור מסתיים בקופסת "✍️ עכשיו בדף התרגילים" עם קישורים לתרגילים (`exercises.html#P16-E06`) — בבנייה הקופסה מוחלפת בקופסת תרגול אחת בסוף השיעור (7.6). בסוף הפרק: קופסת 💼 "בעולם העבודה".

### גדרות קוד (fences) — התכונות שהבנייה מבינה
- ```` ```lang ```` רגיל. `file=path` מוסיף תווית שם קובץ.
- `run` — מריץ את הקוד ומשווה ל־```` ```out ```` שאחריו. השפות: js, ts (strip-types), sql (psql). עם `mjs` הקובץ רץ כ־ESM.
- `tsc` — מריץ tsc ומשווה את השגיאות.
- `save=solutions/X` — שומר את הקוד כקובץ פתרון.
- `stderr` — כולל גם stderr בפלט. ב־SQL הוא גם ממזג את stdout ו־stderr לפי הסדר.
- `fails` — מותר לקוד להיכשל.
- `db=<chapter>/files/x.sql` — טוען את קובץ הנתונים ל־schema נקי לפני הרצת ה־SQL.
- `continue` — psql ממשיך אחרי שגיאה (כדי להדגים ROLLBACK).
- ```` ```term ```` — טרמינל מצויר. `% ` = prompt, `!! ` = שגיאה (אדום), `.. ` = מעומעם.
- **בתוך backticks בטקסט (`` `code` ``) כותבים `<` ו־`>` רגילים, לא `&lt;`.** הבנייה מקודדת בעצמה, ו־`&lt;` היה מוצג כמו שהוא. (זה באג שתוקן — לא לחזור עליו.)

---

## 4. איך בונים ומאמתים

```bash
cd /Users/yeuda/Desktop/Backend
node course-src/build.mjs --verify 16          # בונה ומאמת רק פרקים שמתחילים ב־"16"
node course-src/build.mjs --verify             # הכול (לוקח כמה דקות)
node course-src/build.mjs --fill 18            # כמו --verify, אבל ממלא פלט אמיתי במקום ```out עם "?"
```

**מה האימות בודק:**
- כל דוגמת `run` רצה, והפלט שלה זהה ל־```` ```out ````.
- כל קובץ בדיקה **עובר על הפתרונות** ו**נכשל על קובצי ההתחלה**.
- לכל פרק בדיוק `expectedExercises` תרגילים.

**שיטת העבודה שהוכיחה את עצמה:**
1. כותבים את השיעור עם ```` ```out ```` שמכיל `?`.
2. מריצים `--fill`.
3. **קוראים את הפלטים האמיתיים** ומתקנים כל טקסט שמזכיר מספרים. (נמצאו כמה טעויות של "4 בחיפה" כשהיו 3 וכדומה.)

**חשוב:** כל טענה בשיעור (פלט, הודעת שגיאה, התנהגות) מאומתת בהרצה אמיתית. לא ממציאים פלטים.

**מצב אחרון:**
- אימות מלא של כל הפרקים עבר: 23 פרקים/יחידות, 487 תרגילים, 553 דוגמאות קוד.
- פרקים 16–19 אומתו גם אחר כך, כל אחד בנפרד. **כולם ירוקים.**
- אימות מלא רץ גם **בענן** (לינוקס, PostgreSQL 18 ב־Docker) — זהה למק, כולל פלטי EXPLAIN של פרק 18.
- פרק 20 הושלם: 25 תרגילים, 20 בדיקות + PR2-NEST — **ירוק**.
- פרק 21 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות + PR2-AUTH + PR2-AUTH-DB — **ירוק**.
- פרק 22 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות + PR2-TESTS — **ירוק**.
- פרק 23 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות + PR2-DOCKER — **ירוק** (בדיקות Docker אמיתיות: build, run, compose).
- פרק 24 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות + PR2-PROD + PR2-PROD-DB — **ירוק**.
- **פרויקט 3 (הדגל) הושלם**: `25p-project-shop` — 6 שלבים, 6 בודקי "קופסה שחורה" (PR3-AUTH, PR3-PRODUCTS, PR3-ORDERS, PR3-RACE, PR3-PAY, PR3-SHIP) — **ירוק**. נבדק שהבודק של המרוץ נכשל על גרסה נאיבית (12 הזמנות על 3 יחידות).
- פרק 25 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות + PR2-CI + PR2-CI-DB — **ירוק**. ה־workflow של שלב ח׳ רץ באמת ב־GitHub Actions (branch זמני `ci-demo-25`) — הריצה הראשונה נכשלה ב־typecheck (גילוי 13), השנייה ירוקה ב־35 שניות.
- פרק 26 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות + PR3-REDIS (פרויקט 3 שלב 5) — **ירוק**. בודקי PR3 של שלבים 1–4 עוברים גם על פתרון שלב 5 (בלי Redis).
- פרק 27 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות (17 TS עם בדיקות ביצועים + 3 SQL) — **ירוק**.
- פרק 28 הושלם (רשות): 5 שיעורים, 25 תרגילים, 20 בדיקות — **ירוק**. כל התרגילים בזיכרון עם שעון/random מוזרקים (בלי מסד או Redis).
- פרק 29 הושלם (רשות): 5 שיעורים, 25 תרגילים, 20 בדיקות — **ירוק**. בלי מפתח API ובלי רשת: SDK אמיתי עם fetch מדומה.
- פרק 30 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות (5 בודקי מסמכים, 12 TS, 3 SQL) — **ירוק**. **כל 30 הפרקים ו־3 הפרויקטים בנויים.**
- **מפרק 22 האימות רץ על Node 24** (כמו אצל הלומד): `PATH=/opt/node24/bin:$PATH node course-src/build.mjs --verify`. כל הקורס (0–21) עבר גם על Node 24 בלי שינוי.

---

## 5. הסביבה במחשב הזה (חשוב!)

- **Node:** במחשב מותקן Node 22.14, אבל הקורס מניח Node 24. הבודק מוסיף `--experimental-strip-types` אוטומטית ב־Node < 23.
- **Nest CLI לא רץ על Node 22** (`ERR_REQUIRE_CYCLE_MODULE`). את תבניות הפרויקט קראנו ישירות מ־`@nestjs/schematics`. ללומד כתוב "דורש Node 24".
- **PostgreSQL של המשתמש:** PostgreSQL 18 מהתקנת EDB, ב־`/Library/PostgreSQL/18`, רץ על פורט **5432** ודורש סיסמה. **לא לגעת בו ולא לנחש סיסמה.**
- **PostgreSQL לאימות:** שרת פרטי שמשתמש בבינאריים של EDB, עם תיקיית נתונים משלו.
  - נתונים: `course-src/.pgdata`. פורט **5433**, משתמש `postgres`, `trust` (בלי סיסמה), אזור זמן `Asia/Jerusalem`.
  - `build.mjs` מפעיל אותו לבד (`ensurePg()`).
  - הפעלה ידנית: `/Library/PostgreSQL/18/bin/pg_ctl -D course-src/.pgdata -o "-p 5433 -k /tmp -c listen_addresses=localhost" -l course-src/.pgdata/server.log start`
- **PostgreSQL 14 מ־Homebrew שבור** (חסרה ספרייה). לא להשתמש בו.
- **בענן / לינוקס:** `bash course-src/scripts/cloud-setup.sh` — מפעיל `dockerd`, מריץ קונטיינר `course-pg` (`postgres:18`, פורט 5433, trust, `Asia/Jerusalem`), ומעתיק ממנו `psql`/`pg_isready` 18 ל־`/opt/pg18/bin` (עם libpq שלו). `build.mjs` מוצא לבד את `/Library/PostgreSQL/18/bin` או `/opt/pg18/bin` (או `PG_BIN=`), ואם השרת לא עונה — מפעיל את `.pgdata` (מק) או את הקונטיינר (ענן).
  - apt.postgresql.org חסום ברשת של הענן, ולכן משתמשים ב־Docker Hub. Docker **מותקן ועובד בענן** — רלוונטי לפרק 23.
  - Node בענן: 22.x במערכת, ו־**Node 24 ב־/opt/node24** (הסקריפט מוריד מ־nodejs.org). **לבנייה ולאימות — Node 24** (פרק 22: Jest טוען את Nest 12, שהוא ESM, רק ב־Node 24 עם `--experimental-vm-modules`).
  - במק יש Node 22.14 — כדי לאמת את פרק 22 במק צריך Node 24.
- **התקנות npm:** בוצעו ב־`course-src` (לאימות). גם `course-src/root/package.json` עודכן (מה שהלומד מתקין).

---

## 6. מה בוצע — פרק אחר פרק

| פרק | slug | מה יש | בודק |
|---|---|---|---|
| 0 | `00-setup` | 5 שיעורים, נכתב ביד ישירות ב־backend-course (כולל דף הבית ומילון) | — |
| 1–4 | `01-values-variables` … `04-loops` | ערכים, אופרטורים, תנאים, לולאות. ⚡ מבחני כניסה | בלי בודק |
| 5–7 | `05-functions`, `06-arrays`, `07-objects` | ⚡ | הבודק מתחיל בפרק 5 |
| 8 | `08-modules-errors` | modules, שגיאות, debugger, ESLint, **שיעור 5: regex** (נוסף 19.11.2026, ראה 7.7) | ✔ |
| פרויקט 1 | `08p-project-expenses` | מנהל הוצאות CLI. שלבים 0–4 + reference. בדיקות PR1-LOGIC/STORAGE/CLI | ✔ |
| 9 | `09-git` | Git ו־GitHub. `files/scenarios.mjs` יוצר מאגרי תרגול | בלי בודק |
| 10 | `10-async` | | ✔ |
| 11 | `11-typescript` | `.ts` עם בדיקות `typecheck`. שיעור 3 כולל `keyof`/`T[K]` (7.7) | ✔ |
| 12 | `12-design` | classes, repositories, DI | ✔ |
| 13 | `13-node-npm` | `.mjs` | ✔ |
| 14 | `14-http` | URL, methods, status, headers, curl, REST Client, `node:http`, fetch. `files/demo-server.mjs` (פורט 4000) | ✔ `.mjs` |
| 15 | `15-express` | Express 5, middleware, REST, Zod 4. TypeScript | ✔ |
| פרויקט 2 שלב א׳ | `15p-project-tasks` | tasks-api בזיכרון (Express+Zod). שלבים 0–4 + reference (נוצר בסקריפט). בדיקות PR2-SCHEMA/SERVICE/API/LIST/WEB | ✔ |
| 15.5 | `15w-web-bridge` | HTML, CSS, JS בדפדפן, CORS (נבדק בדפדפן אמיתי) + שיעור 4: דף הדגמה לפרויקט 2. 12 תרגילים. `files/serve-web.mjs` (פורט 5500), `files/products-api.mjs` (פורט 4100) | ✔ |
| 16 | `16-sql` | SQL בסיסי. `files/shop.sql` (נתונים **באנגלית** — הטרמינל של VS Code מציג עברית הפוך) | ✔ SQL |
| 17 | `17-relations` | FK, JOIN, GROUP BY, תת־שאילתות, CTE, פונקציות חלון. `files/store.sql` | ✔ |
| 18 | `18-consistency` | transactions, race conditions (אומתו עם שני חיבורים אמיתיים), indexes/EXPLAIN, N+1, keyset pagination, `pg` מ־Node. `files/bank.sql` (200,000 שורות, 2,000 לקוחות × 100 הזמנות) | ✔ כולל בדיקות מקביליות |
| 19 | `19-prisma` | Prisma 7.10.1. פרויקט Prisma ב־`files/` (schema, migrations, seed). שיעור 4 + `solutions/tasks-api` = **פרויקט 2 שלב ב׳** (PostgreSQL). בדיקה PR2-DB | ✔ |
| 20 | `20-nestjs` | modules, DI, DTOs, pipes, guards, interceptors, filters, Swagger. 25 תרגילים (כל תרגיל = קובץ `.ts` עצמאי שנטען עם `loadNest`). `starter/tsconfig.json` ל־VS Code. שיעור 4 = **פרויקט 2 שלב ג׳** (PR2-NEST) | ✔ |
| 21 | `21-auth` | bcrypt (bcryptjs), JWT (@nestjs/jwt), refresh tokens אטומים (SHA-256 במסד) עם rotation וזיהוי שימוש חוזר, roles, בעלות (404), OWASP API Top 10. שיעור 5 = **פרויקט 2 שלב ד׳**. בדיקות PR2-AUTH (בזיכרון) ו־PR2-AUTH-DB (PostgreSQL אמיתי) | ✔ |
| 22 | `22-testing` | node:test, assert, גבולות, כפילים (mock.fn, mock.timers), זמן ו־TZ, HTTP ו־מסד בדיקות, builders, Jest/supertest ב־Nest, coverage, mutation testing. **רוב התרגילים: הלומד כותב בדיקות, והבודק מריץ אותן על הקוד התקין ועל מוטנטים** (`tools/mutation.mjs`, `files/<id>/mutants.json`). שיעור 5 = **פרויקט 2 שלב ה׳** (PR2-TESTS) | ✔ |
| 23 | `23-docker` | Linux ו־bash (הרשאות, תהליכים, pipelines, סקריפט בטוח), Docker (image/container/volume/port), Dockerfile (cache, .dockerignore, multi-stage, USER, HEALTHCHECK), Compose (רשת, healthcheck+condition, משתנים, override). תרגילי shell נבדקים על fixtures (`tools/shell.mjs`); תרגילי Docker — build/run/compose אמיתיים (`tools/docker.mjs`). שיעור 5 = **פרויקט 2 שלב ו׳** (PR2-DOCKER) | ✔ |
| 24 | `24-production` | לוגים מובנים (JSON, רמות, redact), X-Request-Id ו־AsyncLocalStorage, זמן (רגע מול תאריך מקומי, Intl, שעון קיץ — 27.3.2026/25.10.2026 בישראל, 8.3.2026 בקובה: חצות לא קיים), Idempotency-Key (כולל מרוץ ב־PostgreSQL עם ON CONFLICT — E16 מול המסד), rate limiting (fixed/sliding/token bucket, Retry-After, trust proxy), graceful shutdown. כל התרגילים TS/Express רגילים (`load`), בלי Nest. שיעור 5 = **פרויקט 2 שלב ז׳** (PR2-PROD, PR2-PROD-DB) | ✔ |
| 25 | `25-deploy` | CI ב־GitHub Actions (workflow, services, cache, matrix, needs/if), הגדרות וסודות (Secrets/Variables, להיכשל מהר, TLS למסד בענן), פריסה (Render + Neon, deploy hook, migrations ב־CI, expand/contract, smoke, rollback, blue/green), HTTPS ו־reverse proxy (ניסוי Caddy אמיתי, trust proxy, security headers, health/ready). תרגילי workflow = קובצי `.yml` שנבדקים עם js-yaml (`tests/_workflow.mjs`). שיעור 5 = **פרויקט 2 שלב ח׳** (PR2-CI, PR2-CI-DB) | ✔ |

| 26 | `26-redis` | Redis (מבני נתונים, TTL, MULTI, keyPrefix), cache-aside (מדידה אמיתית: MISS 68–93ms מול HIT ~2.5ms על 20,000 מוצרים), ביטול בגרסה (INCR), stampede/single-flight, הגבלת קצב משותפת (INCR+EXPIRE NX, sorted set, Lua token bucket), מנעול (SET NX PX + token + Lua release), pub/sub, BullMQ (attempts/backoff/delay/jobId, at-least-once, צרכן idempotent, outbox). תרגילים מול Redis אמיתי (`tools/redis.mjs`). שיעור 5 = **פרויקט 3 שלב 5** (PR3-REDIS) | ✔ |
| 27 | `27-algorithms` | סיבוכיות (מדידה אמיתית: includes מול Set — 10K: 1,021ms מול 1.7ms, 80K: 61 שניות מול 16ms), Map/Set (4 דפוסים), שני מצביעים, LRU, מחסנית/תור, רקורסיה, חיפוש בינארי, BFS/DFS, מיון טופולוגי, DP, Trie; שיטת ראיון (6 צעדים + משפטים באנגלית), SQL (second highest, top-N לכל קבוצה עם RANK/ROW_NUMBER, NOT EXISTS מול LEFT JOIN), בנק 20 שאלות Backend ו"באג שפתרתי". טבלת "אחרי איזה פרק" לתרגול 2–3 בשבוע (לפי האפיון). `tests/_perf.mjs`: `fastEnough`, `countingArray` (Proxy שסופר קריאות — בדיקה שחיפוש בינארי לוגריתמי), `seeded`. נתוני SQL: `files/interview.sql` | ✔ |
| 28 | `28-system-design` | שיטה (7 שלבים, אומדנים), אבני בניין (stateless, LB, replicas + read-after-write, cache/תור/CDN), כשלים (timeout, retry+jitter, circuit breaker), קיצור קישורים מקצה לקצה, נתונים בקנה מידה (OFFSET מול cursor — מדידה: 83ms מול 0.057ms על מיליון שורות; consistent hashing — מדידה: 4←5 modulo 80.3% מול טבעת 19.2%; Snowflake/UUIDv7; batching; Bloom filter — 1.2MB, 1.002% FP), פיד היברידי, ומסמך תכנון לחנות הקפה ×100 | ✔ |
| 29 | `29-ai-backend` | `@anthropic-ai/sdk` 1.6 (תלות ב־root וב־course-src). קריאה ראשונה, בלוקים/stop_reason/usage, מחירים (מהתיעוד, נשמר 2026-10-06: Opus 5.5 $4/$20, Sonnet 5.5 $2/$10, Haiku 5.5 $0.10/$0.50; cache read $0.20 ב־Opus/Sonnet 5.5), structured outputs (`messages.parse` + `zodOutputFormat`), tool use (לולאה ידנית + toolRunner), הרשאות בכלים, prompt injection (3 שכבות), streaming ל־SSE, שגיאות/fallback, prompt caching, cache לתשובות, תקציב, פרטיות, לקוח מדומה, evals, workflow (triage), RAG קטן. מודל בכל הדוגמאות: `claude-opus-5-5` | ✔ |
| 30 | `30-career` | GitHub כתיק עבודות (README פרופיל, pinned, סודות, commits), קורות חיים ו־LinkedIn, pitch של 2 דקות ו־STAR, 3 סימולציות ראיון (שאלות פרויקט E05, קוד E13/E14, SQL E15/E16), חיפוש עבודה (ערוצים, מעקב, מטלות בית, דחיות), צ׳קליסט סיום. **תרגילי מסמכים**: הלומד כותב `starter/P30-E06.md` (README פרופיל), `E07.json` (repos), `E10.md` (CV), `E11.md` (LinkedIn), `E12.md` (pitch עברית+אנגלית) — בודקי lint ב־`tests/_docs.mjs` (placeholders, אורך, קישורים, מבנה, פעלים, מספרים); הפתרונות — דוגמאות של דמות בדויה (Noa Cohen), שמורים סטטית ב־solutions/. נתוני SQL: `files/sales.sql` (כולל הזמנה ב־00:30 ב־1.5 שעון ישראל — מלכודת UTC) | ✔ |

### כלי הבודק (`course-src/root/tools/`, מועתקים ל־`backend-course/tools/`)
- **`check.mjs`** — `npm run check <ID>`.
  - מזהים: `P16`, `P16-E06`, `P15.5-E03`, `PR2`, `PR2-DB`.
  - טוען `.env` מתיקיית הקורס.
  - `--dir <path>` מריץ בדיקות של פרויקט על תיקייה אחרת. דוגמה: `npm run check PR2 -- --dir ~/dev/tasks-api`. הוא קובע `CHECK_DIR`.
- **`load.mjs`:**
  - `load(testUrl, file)`, `target(testUrl, file)` — מתחשב ב־CHECK_TARGET ו־CHECK_DIR.
  - `runFile`, `captureLogs`, `typecheck`.
  - `listen(serverOrExpressApp)` ← `{base, close}`.
  - `api(base)` ← `call(method, path, body, {headers, raw})` ← `{status, headers, body}`.
- **`sql.mjs`:** `sandbox(t, testUrl, seedFile?)` יוצר schema זמני במסד של הלומד (`COURSE_DATABASE_URL`). מה שהוא מחזיר:
  - `query`, `rows`, `runFile`, `fileRows`, `expectedRows(file)` (מריץ את קובץ הפתרון על עותק נקי).
  - `pool(max)` (חיבורים מקבילים לאותו schema), `runSql`.
  - `applyMigrations(dir)`, `prisma({clientPath, log})` (Prisma Client עם `-c timezone=UTC -c search_path=<schema>`).
  - הערכים חוזרים כמספרים: int8 ו־numeric. DATE חוזר כמחרוזת.
- **`nest.mjs`:**
  - `loadNest(testUrl, file)` — מקמפל קובץ תרגיל עם tsc (decorators, CommonJS) ל־`<chapter>/.build/<target>/<name>/` ועושה לו require.
  - `nestApp(t, Module, {validation, overrides:[[token,value]], setup})` ← `{app, moduleRef, call}`.
- **`reporter.mjs`** — פלט בעברית (✔/✖, "קיבלנו/ציפינו").

### פרויקט 2 (tasks-api) — "פרויקט שגדל"
- **שלב א׳** (`15p-project-tasks/solutions/tasks-api`): Express 5 + Zod.
  - שכבות: schema ← routes ← service ← repository (async, בזיכרון).
  - שגיאות במבנה `{error:{code,message,details?}}`. קודי השגיאה: VALIDATION_ERROR, INVALID_JSON, TASK_NOT_FOUND, NOT_FOUND, DUE_DATE_IN_PAST (422), INTERNAL.
  - `createApp({repository, now, log, corsOrigins})`.
  - Endpoints: `/health`, `/tasks` (CRUD + `?status&priority&q&sort&page&limit`), `/tasks/stats`.
  - `web/` (דף הדגמה), `scripts/serve-web.mjs`, CORS לפורט 5500.
- **שלב ב׳** (`19-prisma/solutions/tasks-api`): Prisma.
  - `list`/`stats` עברו ל־repository.
  - `PrismaTasksRepository` (סינון ומיון במסד, `nulls: last`, enum של priority מסודר low<medium<high).
  - `src/db.ts` עם `timezone=UTC`.
- **שלב ג׳** (`20-nestjs/solutions/tasks-api`): NestJS 12, **אותו API בדיוק**. **גמור ומאומת (PR2-NEST עובר).**
  - `PrismaService`/`PrismaModule` (global). Tokens `TASKS_REPOSITORY`, `CLOCK`.
  - `ZodValidationPipe` (אותן סכמות). `HttpErrorFilter` (`@Catch()`) לאותו מבנה שגיאות.
  - `configureApp(app)` — filter, CORS, Swagger ב־`/docs` (`z.toJSONSchema`).
  - Prisma בגנרטור: `moduleFormat="cjs"`, `importFileExtension=""`. ה־seed משתמש ב־pg ישירות.
- **שלב ד׳** (`21-auth/solutions/tasks-api`): משתמשים.
  - Prisma: `User` (email unique, passwordHash, role enum user/admin), `RefreshToken` (tokenHash unique, expiresAt, revokedAt), `Task.ownerId` (FK, ON DELETE CASCADE). ה־migration `add_users` נערך ביד: `DELETE FROM "tasks"` (בשיעור: expand ← backfill ← contract לפרודקשן).
  - `src/config.ts`: `ConfigModule` גלובלי עם `CONFIG` (JWT_SECRET ≥ 32 תווים, ACCESS_TOKEN_TTL_SECONDS=900, REFRESH_TOKEN_TTL_DAYS=7, BCRYPT_ROUNDS=12) ו־`CLOCK` (שעבר מ־tasks.tokens, שממשיך לייצא אותו).
  - `src/auth/*`: AuthService (register/login/refresh/logout/me/verifyAccessToken), JwtAuthGuard + RolesGuard כ־`APP_GUARD` (בסדר הזה), `@Public()`, `@Roles()`, `@CurrentUser()`. repositories בזיכרון + Prisma לכל דבר (USERS_REPOSITORY, REFRESH_TOKENS_REPOSITORY).
  - tasks: כל פונקציה ב־repository מקבלת `ownerId`; Prisma עם `findFirst`/`updateMany`/`deleteMany` ו־ownerId ב־WHERE. משימה של אחר ← 404.
  - קודי שגיאה חדשים: UNAUTHORIZED, INVALID_TOKEN, FORBIDDEN, EMAIL_TAKEN (409), INVALID_CREDENTIALS, INVALID_REFRESH_TOKEN.
  - `GET /users` ל־admin. Swagger עם `addBearerAuth()`. `web/` עם כניסה (access בזיכרון, refresh ב־sessionStorage, refresh אוטומטי על 401). seed עם 3 משתמשים (`dana@example.com` / `dana-password-1` וכו׳). `.env.example`.
  - נבדק גם ידנית: שרת אמיתי + הדף ב־Chromium דרך CORS (כניסה, הוספה, רענון, יציאה).
- **שלב ה׳** (`22-testing/solutions/tasks-api`): בדיקות. ה־API לא השתנה.
  - Jest 30 + ts-jest + supertest (כמו תבנית Nest 12). scripts: `test`, `test:watch`, `test:cov`, `test:int` — כולם `node --experimental-vm-modules node_modules/jest/bin/jest.js`. הגדרות Jest ב־package.json (`src/**/*.spec.ts` + `test/*.e2e-spec.ts`); `jest.int.json` ל־`test/*.int-spec.ts`.
  - `test/clock.ts` (TestClock), `test/helpers.ts` (`createTestApp`, `signUp`), `test/db.ts` (`createTestDatabase`: schema אקראי + migrations, `reset` עם TRUNCATE, `close`). `DATABASE_URL_TEST`.
  - 31 בדיקות unit+e2e (~2 שניות) ו־6 integration.
  - **PR2-TESTS**: (1) לפחות 2 unit, e2e אחד, integration אחד; (2) `npm test` עובר עם 20+ בדיקות; (3) int עוברות עם `DATABASE_URL_TEST=COURSE_DATABASE_URL`; (4) הבדיקות של הלומד מועתקות לעותק של **הפתרון של הקורס** (בתוך `<chapter>/.build/`) ועוברות; (5) על 7 מוטנטים בפתרון — נכשלות. מוטנטים: בעלות ב־InMemory findById, dueDate היום, rotation, תוקף ×4, hash בתשובה, RolesGuard, user enumeration. ~20 שניות.
- **שלב ו׳** (`23-docker/solutions/tasks-api`): Docker.
  - Dockerfile multi-stage (`node:24-alpine`): build (`npm ci`, `prisma generate`, `npm run build`) ← runtime (`npm ci --omit=dev --omit=optional`, רק `dist`, `USER node`, HEALTHCHECK עם wget). **435MB** (827MB בלי `--omit=optional`; 2.54GB ב־Dockerfile נאיבי על `node:24`).
  - `--omit=optional` כי `prisma` ו־`typescript` הם optional peers של `@prisma/client` ← npm מסמן `devOptional` ו־`--omit=dev` לא מסיר אותם.
  - `dotenv` עבר ל־dependencies (main.ts מייבא אותו בזמן ריצה). `package-lock.json` נמצא בפתרון (npm ci צריך אותו).
  - compose.yaml: `db` (postgres:18-alpine, healthcheck, volume ל־`/var/lib/postgresql`), `migrate` (`target: build`, `prisma migrate deploy`, depends_on db healthy), `api` (`${API_PORT:-3000}`, `JWT_SECRET:?`, depends_on migrate `service_completed_successfully`), `web` (nginx:1.29-alpine על web/, `${WEB_PORT:-5500}`). seed: `docker compose run --rm migrate npm run db:seed`.
  - **PR2-DOCKER**: סטטי (multi-stage, סדר cache, USER, בלי `COPY . .` אחרון, .dockerignore) + `compose config` + live: up --build --wait בפרויקט מבודד, הרשמה/כניסה/משימה, `id -u` ≠ 0, down/up ← הנתונים נשארים. ~45 שניות עם cache.
  - **תוקן גם בשלבים ג׳–ה׳**: `typescript` ב־package.json של הפתרונות היה `^5.9.0`, אבל `@nestjs/schematics` 12 דורש `>=6` ← `npm install` נכשל עם ERESOLVE. עכשיו `^6.0.2` (כמו תבנית Nest 12). האימות של הקורס עדיין מקמפל עם TS 5.9 מ־course-src — וה־build ב־Docker מוכיח שהקוד מתקמפל גם עם TS 6.0.3.
- **שלב ז׳** (`24-production/solutions/tasks-api`): מוכן לפרודקשן.
  - `src/common/`: `request-context.ts` (AsyncLocalStorage), `logger.ts` (`AppLogger` — JSON, רמות, redact; מממש `LoggerService`; `LOG_SINK` token), `request-id.middleware.ts` (X-Request-Id + שורת "request" ב־finish; `/health` מוצלח ← debug), `observability.module.ts` (@Global), `time.ts`.
  - config: `LOG_LEVEL`, `AUTH_RATE_LIMIT_PER_MINUTE` (10), `IDEMPOTENCY_TTL_HOURS` (24). main: `bufferLogs` + `useLogger`, `TRUST_PROXY` = מספר proxies.
  - `users.time_zone` (ברירת מחדל UTC; register ו־`PATCH /auth/me`), ו־`TasksService.todayFor(ownerId)` — DUE_DATE_IN_PAST ו־overdue לפי אזור הזמן. `TasksService` מקבל עכשיו גם `USERS_REPOSITORY` (TasksModule מייבא AuthModule).
  - `idempotency/`: repository בזיכרון ו־Prisma (create ← P2002 ← findUnique; TTL), `IdempotencyService.run` (400/422/409, release בשגיאה). טבלת `idempotency_keys` עם UNIQUE (user_id, key). migration `…_production_features`.
  - `AuthRateLimitGuard`: חלון נע לכל `req.ip` על register+login; headers `RateLimit-*` ו־`Retry-After`.
  - `PrismaService` עבר ל־`onApplicationShutdown` (ראה גילוי 10). CORS עם `exposedHeaders`. דף ה־web שולח timeZone ו־Idempotency-Key.
  - Jest: 37 בדיקות (+ `test/production.e2e-spec.ts`), 9 integration (+ `test/idempotency.int-spec.ts`). `createTestApp(config)` מחזיר גם `logs`.
  - **PR2-PROD** (dist, בזיכרון, LOG_SINK למערך) ו־**PR2-PROD-DB** (migrations, UNIQUE, 10 בקשות במקביל ← משימה אחת).
- **שלב ח׳** (`25-deploy/solutions/tasks-api`): CI/CD וקישור חי.
  - `.github/workflows/ci.yml`: `test` (services postgres:18-alpine, npm ci, prisma generate, typecheck, test, migrate deploy, test:int, build), `docker` (build + הרצה + curl /health), `deploy` (needs שניהם, רק push ל־main, environment production: migrate deploy עם `secrets.DATABASE_URL`, curl ל־`secrets.RENDER_DEPLOY_HOOK_URL`, `scripts/smoke.mjs` עם `vars.PRODUCTION_URL` ו־`github.sha`).
  - `health.controller.ts`: `/health`, `/ready` (SELECT 1 עם timeout 2s ← 503 NOT_READY), `/version` (`BUILD_INFO`, `readBuildInfo`: GIT_COMMIT ?? RENDER_GIT_COMMIT ?? "dev").
  - `server-config.ts` (`loadServerConfig`: PORT, CORS_ORIGINS, TRUST_PROXY; בפרודקשן חובה DATABASE_URL ו־CORS https). main: `listen(port, "0.0.0.0")`.
  - `prisma/pg-options.ts`: sslmode בכתובת ← `ssl: { rejectUnauthorized: true }` ל־pg (גילוי 14).
  - Dockerfile HEALTHCHECK על `${PORT:-3000}`; compose: `NODE_ENV: development` ל־api (ה־image הוא production).
  - web: `<meta name="api-url">` לכתובת ה־API בפריסה.
  - 51 בדיקות Jest, 9 integration.
- **השלבים שנשארו**: אין — פרויקט 2 גמור.

### פרויקט 3 (coffee-shop) — `25p-project-shop`
- הלומד בונה **מאפס** (repo `~/dev/coffee-shop`), לפי חוזה API מדויק ב־stage-0-plan.html (נתיבים, status codes, error codes, משתני סביבה). השיעורים = דרישות והכוונה; הפתרון ב־reference.html (🔒).
- **בודק קופסה שחורה** — `root/tools/app.mjs` (`startApp`): `CREATE DATABASE chk_shop_…` ← `prisma migrate deploy` של הפרויקט (CLI מ־`createRequire(project).resolve("prisma/build/index.js")`) ← `node dist/main.js` עם PORT/DATABASE_URL/JWT_SECRET/ADMIN_EMAIL/ADMIN_PASSWORD/BCRYPT_ROUNDS=4/NODE_ENV=test ← מחכה ל־/health ← בדיקות HTTP ← SIGTERM ו־`DROP DATABASE … WITH (FORCE)`. ~2 שניות לבדיקה. עוזרים ב־`tests/_shop.mjs` (`shop(t)`: admin, customer, product, orderOf).
- הפתרון (`solutions/coffee-shop`): Nest + Prisma 7. מלאי: `updateMany({ where: { stock: { gte } }, data: { decrement } })` בטרנזקציה, לפי productId; `CHECK (stock >= 0)` ביד ב־migration; snapshot של שם ומחיר ב־order_items; Idempotency (גם 4xx נשמר) על POST /orders ו־/pay; `FakePaymentGateway` (4242… מצליח, 4000…0002 נדחה, 4000…9995 אין כיסוי, Luhn); `order-status.ts` (מכונת מצבים) + מעברים מותנים; תפקיד מהמסד בכל בקשה; מנהל ראשון ב־onApplicationBootstrap; מחיקה רכה (active). `npm test` = unit בלבד; `npm run test:e2e` = מול DB (schema לכל ריצה, `DATABASE_URL_TEST`). web/ עם `<meta name="api-url">`. נבדק ב־docker compose up (seed של 8 מוצרים) ובדפדפן — הצילום ב־`files/shop-web.png`.
- גילוי: Prisma generator בלי `importFileExtension = ""` ← ts-jest לא מוצא `./internal/class.js`.
- **שלב 5 (פרק 26)** — `26-redis/solutions/coffee-shop` (עותק של שלבים 1–4 + Redis; ב־`25p` נשאר שלב 4): `REDIS_URL` רשות (בלעדיו `X-Cache: OFF`, מייל מיד), `REDIS_PREFIX` (shop), `PRODUCTS_CACHE_TTL_SECONDS`, `ORDER_PAYMENT_TIMEOUT_SECONDS` (1800), `WORKER`. `RedisModule` @Global (טוקן ב־`redis.tokens.ts` — אחרת import מעגלי), `CacheService` עם גרסה לקבוצה, BullMQ queue `shop` עם prefix `<prefix>:bull`, jobId `<name>-<orderId>`, Worker באותו תהליך. טבלת `email_outbox` עם `@@unique([kind, orderId])`, `GET /emails` (מנהל). עבודות נוספות **אחרי** ה־COMMIT. `expire` בודק מצב בזמן הריצה (לא מבטלים עבודה בתשלום).
- **PR3-REDIS** (`26-redis/tests`): מריץ את השרת עם `REDIS_URL`=`COURSE_REDIS_URL` ו־`REDIS_PREFIX` אקראי, מוחק את המפתחות בסוף. cache (MISS/HIT/ביטול), מייל פעם אחת, ביטול אוטומטי עם timeout של 2 שניות.

### "גילויים" מהדרך שחייבים לזכור
1. **Prisma 7 + אזור זמן:** כשה־session של המסד לא ב־UTC, Prisma קורא וכותב `timestamptz` בהזזה.
   - **תמיד** `new PrismaPg({ connectionString, options: "-c timezone=UTC" })`.
   - זה נלמד בפרק 19 שיעור 1, ומופיע בכל הקוד.
2. **שינויים ב־Prisma 7:**
   - `prisma.config.ts` (`prisma init` יצר `prisma7.config.ts` — כותבים ביד).
   - אין טעינה אוטומטית של `.env` (`import "dotenv/config"`).
   - `migrate dev` לא מריץ `generate`.
   - חובה driver adapter (`@prisma/adapter-pg`).
   - `DateTime` בלי `@db.Timestamptz(3)` יוצא timestamp בלי tz.
   - `$queryRaw` לא מושפע מאופציית ה־schema של ה־adapter (בבדיקות צריך גם `search_path`).
3. **תגית `latest` של prisma ב־npm מצביעה על 8.0.0-rc** — לנעוץ `^7.10.1`.
4. **Express 5:**
   - `req.query` לקריאה בלבד (זורק בהשמה) — שומרים ב־`res.locals`.
   - `req.body` הוא `undefined` בלי גוף.
   - שגיאות async מגיעות ל־error handler לבד.
   - JSON שבור מגיע כ־`err.type === "entity.parse.failed"`.
5. **Zod 4:**
   - `z.coerce.number("")` מחזיר 0.
   - `z.iso.date()`, `z.strictObject`, `z.toJSONSchema`.
   - הודעות ברירת המחדל: `Invalid input: expected number, received string`.
6. **PostgreSQL 18:** EXPLAIN ANALYZE מציג `rows=10.00` ו־`Index Searches`. בשיעורים משתמשים ב־`(ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF, BUFFERS OFF)` כדי שהפלט יהיה יציב.
7. **NestJS 12:**
   - `nest new` שואל שתי שאלות (נבדק בהרצה, CLI 12.0.12): `@nestjs/observe` (שירות מנוהל — מדלגים עם `--no-observe`) ומערכת מודולים — **ברירת המחדל ESM + Vitest**. בקורס בוחרים **CJS + Jest** (פרק 20 שיעורים 1 ו־4, פרק 22 שיעור 4).
   - הפרויקטים בקורס הם CommonJS, מקומפלים עם tsc (`experimentalDecorators`, `emitDecoratorMetadata`).
   - בדיקות Jest 30.
   - TypeScript ^6 בתבנית.
   - קובץ ה־AGENTS.md בתבנית מקדם שירות בתשלום — **לא להכניס לקורס**.
8. **באג שתוקן ב־build:** ב־`--fill` משתמשים ב־replace עם פונקציה, כי `$'` בקוד (regex) גרם להכפלת הקובץ.
9. **פקודת `rm -rf` על התיקייה הנוכחית נחסמת** על ידי מנגנון הבטיחות. לא מוחקים את ה־cwd.
10. **Nest — סדר הכיבוי:** `onModuleDestroy` רץ *לפני* שה־HTTP server נסגר, ו־`onApplicationShutdown` אחרי. סגירת Prisma ב־`onModuleDestroy` ← בקשה שבאמצע מקבלת 500 (נבדק בניסוי, מצוטט בפרק 24 שיעור 4).
11. **Node 19+:** `server.close()` סוגר לבד חיבורי keep-alive פנויים.
12. **jsonb** מסדר מחדש מפתחות — תשובת replay מ־idempotency_keys מגיעה בסדר שדות אחר (אותו JSON).
13. **`npm run typecheck` היה שבור משלב ד׳** (נתגלה ב־CI אמיתי): `tsconfig.json` עם `"types": ["node"]` בלי jest, ו־`prisma/seed.ts` עם top-level await בפרויקט CommonJS. תוקן בשלבים 20–25: `seed.mts` + `seed: "node prisma/seed.mts"`, ו־`"types": ["node", "jest"]` מ־22. **לאמת גם עם `tsc -p tsconfig.json`, לא רק tsconfig.build.json.**
14. **TLS למסד:** `pg` מדפיס SECURITY WARNING על `sslmode=require` (מתייחס אליו כ־verify-full). Prisma CLI עם `sslmode=verify-full` **מתחבר בלי TLS** (מתעלם מהערך) — לכן בכתובת נשאר `require`, ובזמן ריצה `pgConnectionOptions`.
15. **js-yaml 5 = YAML 1.2**: `on` נשאר "on", אבל `1.10` ← 1.1 ו־`08` ← 8. ייבוא: `import { load } from "js-yaml"` (אין default export). נוסף כתלות מפורשת ב־root ו־course-src.
16. **Render (נבדק נובמבר 2026):** free web service נרדם אחרי 15 דק׳, Postgres חינמי נמחק אחרי 30 יום (לכן Neon), pre-deploy command רק בתשלום (לכן migrations ב־CI + deploy hook).
17. **Redis בענן ובבנייה:** `course-redis` (redis:8-alpine) על פורט **6380**. `build.mjs` מעביר לבדיקות `COURSE_REDIS_URL=redis://localhost:6380` ולבלוקי run `REDIS_URL`. אצל הלומד — ברירת מחדל `redis://localhost:6379`. `tools/redis.mjs`: `redisSandbox(t)` ← ioredis עם `keyPrefix` ייחודי (`chk:…`), ניקוי ב־SCAN בסוף, `connection()` ל־BullMQ.
18. **BullMQ:** לא מקבל `{ url }` ב־connection — צריך `{ host, port, maxRetriesPerRequest: null }` (Worker חוסם). בבדיקות של Worker: לרשום `t.after` **לפני** שמפעילים את קוד הלומד, אחרת starter שזורק משאיר Worker פתוח והבדיקה נתקעת.
19. **ioredis + Promise.all:** 100 קריאות GET+SET במקביל על חיבור אחד ← כל ה־GET יוצאים לפני SET (auto pipelining) ← תוצאה 1 במקום 100. משמש בשיעור 3 כהדגמת מרוץ דטרמיניסטית.
20. **e2e של coffee-shop:** `afterAll(() => t?.close())` — אם `beforeAll` נכשל, `t` undefined ו־Jest נתקע.
21. **`Array.prototype.shift` ב־V8:** מהיר על מערכים קטנים (מקצר בלי להעתיק), ריבועי על גדולים — ריקון 10K: 0.5ms; 100K מספרים: 768ms; 100K מערכים קטנים: 8.2 שניות. מצוטט בפרק 27 (שיעורים 1, 3; E01). עומק רקורסיה ב־Node 24: 12,525 בפונקציה ריקה.
22. **TypeScript parameter properties** (`constructor(private x: number)`) לא נתמכים ב־`--experimental-strip-types` — בפתרונות שנטענים ב־`load` כותבים שדה רגיל.
23. **`x | 1` ב־JavaScript מחזיר int32 עם סימן** — בפתרון הראשון של Bloom filter (פרק 28, E25) זה יצר מיקומים שליליים, ו־`Uint8Array[-5] |= …` לא זורק ולא כותב ← false negatives. תוקן עם `>>> 0`, ומצוטט בתרגיל כ״טעות נפוצה״.
24. **SDK של Anthropic (1.6, נבדק עם fetch מדומה):** המפתח נשלח ב־`authorization: Bearer` (לא `x-api-key`); `anthropic-version: 2026-10-21` (בגרסה הזו `temperature` מחזיר 400); 429 ← 3 בקשות (2 retries, כ־1.5 שניות) ואז `RateLimitError`; 400 ← בלי retry; `messages.parse` **זורק** `AnthropicError` (לא `APIError`) על JSON לא תקין/לא לפי הסכמה/חתוך — לא מחזיר null. מצוטט בשיעורים 1–2 וב־E05.
25. **בודקי פרק 29:** `tests/_claude.mjs` — `fakeClaude(respond)` בונה לקוח SDK אמיתי עם `fetch` מדומה ו־`maxRetries: 0`; `message()`, `toolUse()`, `thinking()`. לולאה בלי תקרה: הספק המדומה מחזיר 400 אחרי 20 קריאות (`_loop.mjs`) — כדי שהבדיקה תיכשל מהר ולא תיתקע. template literal (`${x}`) של undefined הוא "undefined", אבל `[undefined].join("")` הוא "" — לכן ה־starter של E20 משתמש ב־template literal.
26. **בדיקות מסמכים בעברית:** `\b` ב־regex של JS (בלי דגל u) לא עובד סביב אותיות עבריות — משתמשים ב־`(^|[^\u0590-\u05FF])כי([^\u0590-\u05FF]|$)`. וספירת מילים: בעברית יש פחות מילים לאותו תוכן (ו־/ה־/ב־ צמודות) — טווח נפרד (140–280 מול 200–330 באנגלית).
27. **מספרים בתוכן לדוגמה** — לבדוק מול הקוד: ה־CV לדוגמה כתב "25+ endpoints" ובפתרון יש 22 (נספר עם grep על @Get/@Post…) ← תוקן ל־"20+". כל מספר בחומרים צריך מקור.
28. **Kafka: producer כותב כפול מול topic שזה עתה נוצר** — בבדיקה של E25 (26.5) הופיעו אותן הודעות פעמיים ב־partition (retry של ה־producer אחרי שגיאה זמנית). נפתר עם `idempotent: true` ב־producer של ה־sandbox; מצוטט בשיעור 4 כ"ראינו את זה קורה".
29. **SQS short polling חוזר ריק גם כשיש הודעה** — ב־LocalStack, receive בלי `WaitTimeSeconds` אחרי שה־visibility timeout פג החזיר כלום. כל דוגמה/בדיקה מקבלת משתמשת ב־`WaitTimeSeconds ≥ 1`.
30. **amqplib: ack שנשלח ממש לפני `conn.close()`** לא תמיד מגיע ל־broker — בדיקת "ack לפני טיפול" (E20) עברה על הקוד השבור עד שנוסף `sleep(200)` לפני הסגירה.
31. **pool של pg מחזיר את אותו client** — proxy שעוטף `client.query` בכל `connect()` נעטף שוב ושוב (ספר כל COMMIT כמה פעמים). WeakSet של clients שכבר נעטפו.
32. **דוגמאות שמבוססות על סף זמן תלויות במכונה** — ב־E03 (28.5) `pbkdf2Sync` עם 400 אלף איטרציות לקח פחות מ־100ms, והדוגמה "הוכיחה" שהוא לא חוסם. הוחלף במדידת סדר (האם ה־timer רץ בזמן העבודה או אחריה) — דטרמיניסטי בכל מחשב.
33. **`approx_count_distinct` של DuckDB 1.5.6** סטה ב־3.1% על מזהים אקראיים וב־11–12% על רצף (`range % 250000`, `range*7919 % 250000`). מצוטט בשיעור 4 כ"הערכה — לבדוק מול ספירה מדויקת".
34. **Israel DST 2026:** שעון חורף מ־25.10.2026 (UTC+2). נתוני בדיקה של "אחרי חצות" ב־30.10 צריכים 22:30Z, לא 21:30Z — נבדק עם Intl לפני שנכתב.

---

## 7. מה נשאר לעשות

### 7.0 הרחבה לפי מודעת דרושים — חצאי־פרקים ופרויקט 4 (נבנו)
יהודה הראה מודעת Backend Developer (Node.js, MySQL, AWS+K8s, Jenkins/Argo CD, SQS/Kafka/RabbitMQ, agentic AI, Redis/ElastiCache, BigQuery/Snowflake/Databricks, נפחי נתונים ותעבורה גבוהה). **החלטות שלו (8.11.2026):** לא חטיבה חדשה — לשלב בסדר הלימוד, כ**חצאי־פרקים** (כמו 15.5, כדי שמזהי תרגילים קיימים לא ישתנו), ו**פרויקט 4 חדש** שמחבר את הנושאים.
| יחידה | slug (מיון לפי שם התיקייה) | אחרי | בודקים מול |
|---|---|---|---|
| 25.5 MySQL (היה 19.5) | `25v-mysql` (מזהים `P25.5-E06`) | פרויקט 3 | MySQL 8.4 בקונטיינר `course-mysql` (3307) — `root/tools/mysql.mjs` |
| 26.3 ענן ו־Kubernetes (היה 25.5) | `26c-cloud` (מזהים `P26.3-E06`) | Redis (פרק 26) | LocalStack (S3, SQS…) + ולידציה של manifests/Helm/Jenkinsfile/Argo CD |
| 26.5 תורים ואירועים | `26w-messaging` | Redis | RabbitMQ, Kafka (KRaft), SQS (ElasticMQ/LocalStack) |
| 28.5 ביצועים ונתונים בקנה מידה | `28w-scale` | תכנון מערכת | מדידות, autocannon; DuckDB כמנוע עמודתי |
| 29.5 סוכני AI | `29w-agents` | פרק 29 | SDK של Anthropic עם fetch מדומה |
| פרויקט 4 | `29x-project-events` | 29.5 | מערכת אירועים ואנליטיקה: Kafka ← MySQL + עמודתי, על Kubernetes |
- `build.mjs`: fence חדש ```` ```sql run mysql db=25v-mysql/files/shop.sql ```` — רץ ב־`docker exec course-mysql mysql --table`; בלוקי ts מקבלים `MYSQL_URL`, ובדיקות `COURSE_MYSQL_URL`.
- כל ה־images נבדקו ונמשכים: mysql:8.4, rabbitmq:4-alpine, apache/kafka:4.1.0, localstack/localstack:4.14.0, softwaremill/elasticmq-native.
- **מצב 25.5 (MySQL, לשעבר 19.5):** בנוי ומאומת (5 שיעורים, 25 תרגילים, 20 בודקים — כולל deadlock אמיתי וסימולציה של 6 workers).
- **מצב 26.3 (ענן, לשעבר 25.5):** בנוי ומאומת (`--verify 26c`). LocalStack בקונטיינר `course-localstack` על **4566**, **מוצמד ל־`localstack/localstack:4.14.0`** — ה־tag `:4` נעצר ב־4.14 (פברואר 2026), והגרסאות שאחריו דורשות auth token. `root/tools/aws.mjs`: `bucketSandbox(t)`, `queueSandbox(t)` (bucket/queue ייחודי, ניקוי בסוף); `build.mjs` מעביר `COURSE_AWS_ENDPOINT` לבדיקות ו־`AWS_ENDPOINT_URL` לבלוקי run. בודקים בלי cluster: `tests/_k8s.mjs` (קריאת multi-doc YAML עם החבילה `yaml`, selector↔labels, כמויות, ports בשם), `tests/_iam.mjs` (מעריך policy: Deny מפורש ← Allow ← implicit deny, wildcards, Condition על s3:prefix), `tests/_jenkins.mjs` (parser של declarative pipeline לעץ בלוקים — מדלג על מחרוזות והערות). **kind/helm לא הורצו בסביבת הבנייה** (המסווג חסם הרצת binary שהורד; get.helm.sh חסום) — לכן אין דוגמאות עם פלט של kubectl/helm, רק פקודות בלי פלט. E25 (`bumpImageTag`) משתמש ב־`yaml.parseAllDocuments` ששומר הערות ומרכאות — נבדק שה־diff הוא רק שורות ה־image.
- **מצב 26.5:** בנוי ומאומת (`--verify 26w`). קונטיינרים: `course-rabbit` (rabbitmq:4-alpine) על **5673**, `course-kafka` (apache/kafka:4.1.0, KRaft, advertised `localhost:9095`) על **9095**; SQS דרך LocalStack. `build.mjs` מעביר `COURSE_RABBIT_URL`/`COURSE_KAFKA_BROKERS` לבדיקות ו־`RABBIT_URL`/`KAFKA_BROKERS` לבלוקי run. לקוחות: `amqplib` 2.2.0 (עם טיפוסים; 2.3.0 יצא ביום הבנייה — לא נבחר), ו־**`@platformatic/kafka`** 2.15 (KafkaJS נבדק ועובד מול Kafka 4.1, אבל לא עודכן מאז 2023 ומדפיס TimeoutNegativeWarning ב־Node 24 — מוזכר בשיעור כמה שתפגוש בקוד קיים). `root/tools/mq.mjs`: `rabbitSandbox(t)` (שמות ייחודיים לתורים/exchanges, `depth`, `drain`), `kafkaSandbox(t)` (topic ייחודי, producer **idempotent**, `readAll`, `committed`), `waitFor`, ו־`deadline(promise, ms, msg)` — נכשל עם הסבר ו־`process.exit(1)` אחרי 300ms, כי consumer תקוע של הלומד משאיר את התהליך חי.
- **מצב 28.5:** בנוי ומאומת (`--verify 28w`). בלי קונטיינרים חדשים: DuckDB רץ בתוך Node (`@duckdb/node-api` **1.5.6-r.2** — 2.0.0-r.1 היה בן שבועיים וגרסה ראשית חדשה, לא נבחר). `files/orders.parquet` (60,000 הזמנות, אוקטובר 2026) נוצר דטרמיניסטית מ־`files/make-orders.mjs`. `tests/_duck.mjs`: `duck(t)` ← view בשם `orders` על הקובץ, `fileRows`/`expectedRows` לתרגילי SQL. בלוקי run של DuckDB מייצרים נתונים עם `range()` (הם רצים בתיקייה זמנית, בלי גישה ל־files). בדיקות זמן (E08, E14, E23, E24) הורצו 3 פעמים ברצף — יציבות.
- **מצב 29.5:** בנוי ומאומת (`--verify 29w`). בלי קונטיינרים: `tests/_claude.mjs` (עותק של פרק 29 — SDK אמיתי עם fetch מדומה), `tests/_mcp.mjs` (שרת MCP של הלומד + client ב־`InMemoryTransport`). `@modelcontextprotocol/sdk` **1.32.2** (`registerTool`; `tool()` מסומן deprecated). `files/store.ts` — חנות בזיכרון, משותפת לתרגילים. נבדק מול ה־skill של claude-api: Opus 5.5 ($4/$20, cache read $0.20), אין `tool_choice` מאולץ, `fallbacks: "default"` + beta `server-side-fallback-2026-07-01`, היסטוריה append-only (preserved thinking — עריכה של תורות קודמים נכשלת בחשבונות מ־31.8.2026), context editing/compaction בצד השרת. E25 מייבא את `evaluateTrajectory` מ־E13 של הלומד (כתוב בתרגיל).
- **מצב פרויקט 4 (`29x-project-events`, label "פרויקט 4", num "P4"):** בנוי ומאומת (`--verify 29x`). פתרון לדוגמה: `solutions/events-platform` — TypeScript שרץ ישירות ב־Node 24 (בלי build; `tsc --noEmit` נקי עם ה־tsconfig שבפרויקט), `src/{ingest,processor,export,query,assistant,time,config,main-*}.ts`, `migrations/001_init.sql`, `k8s/platform.yaml`, `.github/workflows/ci.yml`, `compose.yaml`, ו־`test/e2e.test.ts` (HTTP ← Kafka ← MySQL ← Parquet ← query API — עבר מול הקונטיינרים). בודקים: PR4-INGEST, PR4-PROCESS, PR4-EXPORT, PR4-QUERY, PR4-DEPLOY, PR4-AGENT (רשות). `tests/_events.mjs`: `eventsDb(t)` מריץ את ה־migrations של הלומד על database חדש, pool עם `dateStrings: true` (חלק מהחוזה); `loadP`/`fileP` ← `events-platform/...` (עם `--dir`). הבודק של PR4-DEPLOY מצא באג אמיתי בפתרון (CronJob בלי limits) — תוקן.

### 7.1 מצב: הקורס הושלם
כל 30 הפרקים (0–30, כולל 15.5 ו־15w), ושלושת הפרויקטים (כולל שלב 5 של פרויקט 3) — בנויים ומאומתים. מה אפשר להמשיך, אם יהודה יבקש:
- **פרויקט 4** — נבנה כ"מערכת אירועים ואנליטיקה" (7.0). פרויקט ה־AI הרשותי מהאפיון (10.4, "עיבוד מסמכים עם AI") לא נבנה — יחידה 29.5 ושלב 5 של פרויקט 4 מכסים את רוב מה שהוא היה מלמד.
- **משוב מהלומד** — יהודה עובר על הפרקים; תיקונים לפי מה שהוא נתקע בו.
- **בדיקה ויזואלית תקופתית** (סעיף 7.3) ועדכון מחירים/מודלים בפרק 29 כשהם משתנים.
נקודות מפרק 30:
- גילויים 26–27.
- תרגילי מסמכים: התבנית ב־starter מכילה TODO/YOUR-USER בכוונה — כך הבודק נכשל עליה.
נקודות מפרק 29:
- גילויים 24–25.
- לא נעשתה שום קריאה אמיתית ל־API (אין מפתח בסביבה, ואין לבזבז כסף של יהודה). כל פלט בשיעורים — מהרצה אמיתית של ה־SDK עם fetch מדומה; תשובות "של המודל" בדוגמאות מסומנות במפורש כמדומות.
- הקוד של הפתרונות נבדק גם עם `tsc --strict` מול הטיפוסים של ה־SDK (20 קבצים).
נקודות מפרק 28:
- גילוי 23 (Bloom filter ו־`| 1`).
- E16 לא מייבא את E13 של הלומד (אחרת תלות בין תרגילים) — מקבל `makeRing`, והבודק נותן טבעת משלו (`tests/_ring.mjs`).
- E23: הבאגים בקובץ ההתחלה חייבים להתאים לתיאור — נבדק שכל באג לבד נתפס (מוטנטים).
נקודות מפרק 27:
- בדיקות ביצועים: גבולות נדיבים (300–1500ms) מול פתרון נאיבי שנמדד (50K עם includes ≈ 1 שנייה). לא להשתמש ב־n שבו הנאיבי לוקח דקות — הלומד מחכה.
- תרגילי SQL של הפרק משתמשים ב־`{{RAW:E12}}` בהרכבה (קובץ ה־.sql נכנס כמו שהוא לתוך גדר ```` ```sql run … save= ````).
נקודות מפרק 26:
- התלויות `ioredis` ו־`bullmq` נוספו ל־`course-src/package.json` ול־`root/package.json` (הלומד: `npm install`).
- מספרי המדידה בשיעור 2 (MISS/HIT) הם מהרצה אמיתית ב־docker compose עם 20,000 מוצרים; הלוגים והפלט של `GET /emails` בשיעור 5 — מהרצה אמיתית של הפתרון עם `ORDER_PAYMENT_TIMEOUT_SECONDS=20`.
נקודות מפרק 25:
- ה־branch הזמני `ci-demo-25` ב־GitHub לא נמחק (מחיקת branch מרוחק נחסמה ע"י מנגנון הבטיחות) — יהודה יכול למחוק ב־GitHub ← Branches.
- `cloud-setup.sh`: ההמתנה ל־dockerd הוגדלה ל־90 שניות (אחרי הפסקה ארוכה העלייה הראשונה לקחה מעל 30).
נקודות מפרק 24:
- תרגילי זמן נשענים על חוקי IANA של Node 24 (ישראל 2026: קיץ 27.3 02:00, חורף 25.10 02:00). דוגמאות שתלויות ב־TZ של המחשב — לא בבלוק run (הוצאו לטקסט).
- E16 ו־PR2-PROD-DB רצים מול PostgreSQL (`database: true`).
נקודות מפרק 23:
- **Docker בענן:** `cloud-setup.sh` מפעיל dockerd, ובונה `node:24-alpine` **מקומי** שסומך על תעודת ה־proxy של הסביבה (`/root/.ccr/ca-bundle.crt`) — בלעדיו `npm` בתוך build נכשל עם `self-signed certificate in certificate chain`. ה־Dockerfiles של הקורס לא משתנים. ל־`node:24` (debian) צריך אותו טריק אם משתמשים בו.
- `build.mjs` תומך ב־```` ```bash run ```` (רץ בתיקייה זמנית, `LC_ALL=C`). **פלטים של כלי GNU** (`ls` וכו') — אימות פרק 23 רק בענן/לינוקס, לא במק.
- Dockerfile לא תומך בהערה בסוף שורה (`WORKDIR /app # x` שבור) — רק בשורה משלה.
- PostgreSQL 18 image: volume ב־`/var/lib/postgresql`, `PGDATA=/var/lib/postgresql/18/docker`. mount ל־`/var/lib/postgresql/data` ← הקונטיינר מסרב לעלות (ההודעה מצוטטת בשיעור 4).
- bash של macOS הוא 3.2: בלי מערכים אסוציאטיביים, בלי `${x,,}`; `wc -l` ב־BSD מרפד רווחים. פתרונות התרגילים נכתבו בהתאם, והבודק מנרמל רווחים.
- תרגילי Docker: תיקייה לכל תרגיל (`starter/P23-E12/` עם האפליקציה + Dockerfile/compose), `save=solutions/P23-E12/Dockerfile`, ו־`solutions/` הסטטי מכיל את כל הקבצים. קבצים כמו `.env` ו־`node_modules` (שב־.gitignore) **נוצרים בבדיקה** בעותק זמני (E13).

### 7.2 שאר הקורס (לפי האפיון, סעיף 8)

כל הפרקים במפת האפיון (סעיף 8) נבנו, וגם ההרחבה לפי המודעה (7.0): 19.5, 25.5, 26.5, 28.5, 29.5 ופרויקט 4.

### 7.3 בסוף
- אימות מלא: `node course-src/build.mjs --verify` — הכול ירוק. **בוצע ב־8.11.2026 אחרי פרק 30:** 35 יחידות, 605 דוגמאות קוד הורצו, כל הבודקים עברו על הפתרונות ונכשלו על קובצי ההתחלה (exit 0, Node 24, בענן). האימות מצא שני דפים בפרק 25 שלא נבנו מחדש אחרי --fill — תוקן.
- עדכון דף הבית (README.html נבנה אוטומטית מ־chapter.mjs).
- בדיקה ויזואלית של כמה דפים בדפדפן: RTL, איורי SVG (טקסט עברי ב־SVG עם `direction="rtl"`), מצב כהה.
- הודעה ליהודה מה מוכן ואיך להתחיל.

### 7.4 עדכון 9.11.2026 — סוכני ביקורת והחלטות של יהודה
- **סוכנים:** `.claude/agents/` — `lesson-designer` (עיצוב), `market-researcher` (מחקר שוק; שואל לפני שינוי), `curriculum-architect` (מבנה וסדר), `agents-manager` (בקרה ואיחוד). הרצה ראשונה ב־9.11.2026; ההחלטות — באפיון, נספח ב׳.
- **הועבר:** MySQL 19.5 ← `25v-mysql` (25.5), ענן 25.5 ← `26c-cloud` (26.3). פרק 26 ו־26.5 עברו לחטיבה ד׳ (בדף הבית 26.5 הופיעה לפני 26).
- **פרקים 28–29 חובה** (בלי "(רשות)").
- **פרק 24 שיעור 6** (observability, E26–E30), **פרק 26 שיעור 6** (SSE/WebSocket/fan-out, E26–E30, תלות חדשה `ws`), **פרק 30 שיעור 5** (עוזר קוד AI, E26–E30; חיפוש עבודה עבר לשיעור 6). בפרקים האלה `expectedExercises: 30`.
- **יחידה 25.7 MongoDB** — `25w-mongodb`, מזהים `P25.7-E06`. קונטיינר `course-mongo` (mongo:8, replica set `rs0`) על **27018**; `build.mjs` מעביר `MONGO_URL` לבלוקי run ו־`COURSE_MONGO_URL` לבדיקות. `root/tools/mongo.mjs`: `mongoSandbox(t, url, { seed })` ← database זמני עם `files/seed.mjs`. תלות `mongodb` 7.8.0.
- **גילויים:** (35) Docker Hub החזיר 429 על mongo:8 — `cloud-setup.sh` מושך מ־`mirror.gcr.io/library/mongo:8` כגיבוי. (36) Mongo standalone בלי replica set: טרנזקציה נכשלת עם "This MongoDB deployment does not support retryable writes". (37) `insertOne` מוסיף `_id` לאובייקט שקיבל — בדוגמה שמדפיסה את האובייקט צריך עותק. (38) `$pull`/`$push` על `db.collection()` בלי טיפוס — שגיאת TypeScript ב־strict; משתמשים ב־`db.collection<T>()`. (39) OpenTelemetry sdk-node 0.301: `NodeSDK` בלבד (אין `tracing` namespace); ConsoleSpanExporter ב־`@opentelemetry/sdk-trace`.

### 7.5 עדכון 10.11.2026 — תרגול כתיבה (סוכן `exercise-coach`)
- **החלטות של יהודה:** 3 תרגילים חדשים לכל יחידה ממוספרת (2 🔁 חזרה + 1 חדש; בפרקים 1–2 כולם חימום/מאפס), קובץ התחלה מדורג (פרקים 1–8: החדש הראשון עם חתימה; מפרק 9: ריק עם הערה), בודק פלט לפרקים 1–4, שורת `@type`, ועבודה לפי הסדר 1 ← 30. פרטים: אפיון 6.1 ("חריג מתוכנן 2") ו־6.4.
- **בוצע — פרקים 1–4:**
  - `build.mjs`: `@type` (ראה סעיף 3). `reporter.mjs`: מציג את ההודעה שכתבנו ב־assert (ok/fail/match) במקום "קיבלנו false".
  - `checker: true` בפרקים 1–4. קופסת 🧰 של פרק 1 מסבירה את העתקת `package.json` ו־`tools` (כמו שהייתה בפרק 5); פרק 5 מפנה לפרק 1.
  - **בודק פלט** ל־60 תרגילי כתיבה קיימים: פרק 1 — 13 (E06–E09, E11–E16, E18, E24–E25), פרק 2 — 15 (E06–E18, E24–E25), פרקים 3–4 — 16 כל אחד (E06–E19, E24–E25). לא נבדקים: תרגילי הסבר/ניבוי (P01-E10, E17, E19; P02-E19) ותרגילי התיקון E20–E23 קיבלו בודק בהמשך (ראה 7.5).
  - **`tests/_out.mjs`** (עותק זהה בכל אחד מפרקים 1–4, כדי שלא יהיה צורך להעתיק `tools` מחדש): `run(url, file, {changes})` מריץ את הקובץ, או עותק שלו שבו ערך הוחלף. ההחלפה לא נוגעת בהערות שבראש הקובץ. בנוסף: `sameOutput`, `printed`, `ranOk` (לולאה אינסופית ← הודעה אחרי 10 שניות), `source`, `code` (בלי הערות), `strings`.
  - התרגילים עברו מ־`playground/` לקובץ ב־`starter/` שיש בו רק הערה. ב־E07 (פרקים 1–2), P03-E11 ובחלק מהאתגרים הקובץ כולל את הקוד או את הנתונים שהמשימה נותנת. לכל משימה נוספה שורת "📄 כותבים בקובץ ... · `npm run check`". הניסוח הושלם בשמות המשתנים ובפורמט הפלט שהבודק דורש.
  - **חדשים (`expectedExercises: 28`):**
    - פרק 1: E26 🔥 תעודת זהות של ערך, E27 🔥 חיישן טמפרטורה, E28 ✍️ משחק: חיים ונקודות.
    - פרק 2: E26 🔥 אגורות לשקלים, E27 🔥 פירוק אימייל, E28 ✍️ חשבון חשמל.
    - פרק 3: E26 🔥 שעות פתיחה, E27 🔁 טלפון לתצוגה, E28 🔁 חניון.
    - פרק 4: E26 🔥 סכום עד יעד, E27 🔁 ספירת סטטוסים (switch), E28 🔁 טבלת טמפרטורות.
- **בוצע — פרקים 5–12 (בלי 08p), סבב 2:** בכל פרק E26–E28 ו־`expectedExercises: 28`, קישורים מקופסת התרגול של השיעור המתאים. בפרקים 5–8 התרגיל החדש עם חתימה (ב־8: מודול הכסף), מפרק 9 קובצי התחלה ריקים.
  - **עוזרי בדיקות לכל פרק** (בתוך `tests/` של הפרק, כדי שלא יהיה צורך להעתיק `tools` מחדש): `_src.mjs` בפרקים 5–8 ו־10 (`exportsOf` — הודעה ברורה כשחסר ייצוא; `code` — הקוד בלי הערות), `_git.mjs` בפרק 9, `_ts.mjs` בפרקים 11–12 (`typecheck`, `exportsOf`, `code`, ו־`typeProbe`).
  - **`typeProbe`**: קובץ `.ts` זמני שמייבא מהקובץ של הלומד (המחרוזת `FILE` מוחלפת בנתיב). שורות רגילות חייבות לעבור, ושורות אחרי `// @ts-expect-error — הסבר` חייבות להיכשל. ההודעה היא שורה אחת (ה־reporter מציג רק את השורה הראשונה): הבעיה הראשונה, ההסבר, ו"(ועוד N)".
  - **פרק 9:** לראשונה יש בודק (בלי `checker: true` — רוב הפרק עדיין ב־Terminal; נוספה פסקה בקופסת 🧰). `runGitScript` מריץ את `starter/P09-E26.sh` ב־`bash` בתיקייה זמנית, עם `GIT_CONFIG_GLOBAL` זמני (שם, אימייל, `main`, בלי עורך), ובודק log, ‏`ls-files`, ‏`git show` ו־status.
  - **חדשים:**
    - פרק 5: E26 🔥 מונה עם זיכרון (closure), E27 🔁 טקסט לקוד סטטוס (switch), E28 🔁 מספר ראשוני (לולאה + guard).
    - פרק 6: E26 🔥 range, E27 🔁 סדרת קולץ (while), E28 🔁 מחירון עם נקודות (padEnd/padStart/slice/toFixed).
    - פרק 7: E26 🔥 mapValues עם Object.fromEntries, E27 🔁 מלאי פרטי (closure + Map), E28 🔁 יתרה מאירועים (switch בתוך reduce).
    - פרק 8: E26 ✍️ מודול כסף ב־ES Modules (שני קבצים), E27 🔁 כפילויות ברשימת הרשמה (Set + TypeError), E28 🔁 מפרש פקודות ל־CLI (switch + split + throw).
    - פרק 9: E26 ✍️ מאגר ראשון — כסקריפט (.sh), E27 🔁 ניתוח של git log (indexOf/slice/split + ספירה), E28 🔁 ‎.gitignore קטן משלך (startsWith/endsWith + some).
    - פרק 10: E26 🔥 חיבור אסינכרוני עם callback (error-first, תמיד אסינכרוני), E27 🔁 סכום הזמנה במקביל (map/reduce + Promise.all, נמדד זמן), E28 🔁 כל העמודים (while + await, pagination).
    - פרק 11: E26 ✍️ Omit/Pick/Partial/Record (utility types), E27 🔁 משך זמן מטקסט ובחזרה (number | null), E28 🔁 שליפת משתמשים: נמצאו וחסרים (Promise.all + Set).
    - פרק 12: E26 ✍️ מחסן כמחלקה (המשך של P07-E27), E27 🔁 Money — אובייקט ערך (private constructor, פסיקים כמו P05-E25), E28 🔁 דוח הלקוחות הגדולים (service + repositories מזויפים, תופס N+1).
- **בוצע — פרקים 13–22 (בלי 15p), סבב 3:** בכל פרק E26–E28 ו־`expectedExercises: 28`; ביחידה 15.5 המזהים E13–E15 ו־`expectedExercises: 15`. קובצי התחלה ריקים (הערה עם המשימה ושם הייצוא), קישורים מקופסת התרגול של השיעור המתאים.
  - **עוזרי בדיקות:** `tests/_src.mjs` בפרקים 13, 14 ו־15.5 (גרסת ESM: ההודעה אומרת `export function` / `export class`). ‏`tests/_ts.mjs` בפרקים 15–19, 21–22 (ב־15: הודעת `export const` לסכמות; **ב־21–22: עם `--typeRoots <course>/node_modules/@types --types node`**, אחרת `Buffer` ו־`node:crypto` לא מוכרים כשהקובץ לא מייבא חבילה). בוחן טיפוסים (`typeProbe`) רץ מתיקייה זמנית, ולכן אסור לו לייבא חבילות (`pg`, ‏`express`) — לוקחים את הטיפוס מהקובץ של הלומד (`Parameters<typeof f>[0]`).
  - **פרקי SQL:** תרגילי SQL נבדקים עם `sandbox` + `fileRows`/`expectedRows`, ותרגילי DDL גם עם שורות שחייבות להידחות. את ה־```out של SQL מילאתי עם `node course-src/build.mjs --fill <prefix>` (גדר `out` עם `?` בלבד).
  - **`tests/_schema.mjs` בפרק 19 (חדש):** `schemaToSql(testUrl, file)` מריץ `prisma migrate diff --from-empty --to-schema ... --script` בתיקייה זמנית. **חובה** קובץ config עם `datasource` (גם `{ url: undefined }`), אחרת Prisma 7 מחזיר פלט ריק עם קוד 0.
  - **פרק 20:** הבודקים טוענים את הקובץ עם `loadNest` ובודקים בעצמם שהייצוא קיים (קובץ ריק מתקמפל לקובץ ריק).
  - **פרק 22:** ‏E26 הוא "כתוב את הבדיקות" (`files/P22-E26/` עם `variants` ו־11 `mutants`); קובץ ה־spec בהתחלה ריק לגמרי (גם בלי imports). הקוד הנבדק הועתק גם ל־`starter/` ול־`solutions/` כמו בשאר התרגילים.
  - **חדשים:**
    - פרק 13: E26 ✍️ פירוק שורת לוג עם regex (Common Log Format), E27 🔁 העלאת גרסה semver (switch), E28 🔁 מיזוג קובצי הגדרות במקביל (Promise.all + reduce).
    - פרק 14: E26 🔥 פירוק header של Cookie, E27 🔁 סטטיסטיקת בקשות כמחלקה (class + Map + sort), E28 🔁 לחכות שהשרת יעלה (while + await + fetch).
    - פרק 15: E26 ✍️ API משימות מקובץ ריק (Express + Zod), E27 🔁 סכמת הרשמה עם regex (Zod ‏regex/transform/pipe), E28 🔁 סכום עגלה (Map + reduce בתוך route).
    - יחידה 15.5: E13 ✍️ טבלת HTML מנתונים, E14 🔁 debounce (closure + setTimeout), E15 🔁 לוח בקרה במקביל (Promise.allSettled).
    - פרק 16: E26 ✍️ יומן אימונים — CREATE TABLE + INSERT + שאילתה מקובץ ריק, E27 🔁 בונה שאילתות עם פרמטרים ב־TS (switch + type, רץ על המסד, בודק injection), E28 🔁 אזור לכל לקוח (CASE בצורה הקצרה כ־switch, NULL ב־ELSE).
    - פרק 17: E26 ✍️ הספרייה מ־P17-E01 בקוד (5 טבלאות, CASCADE מול חסימה), E27 🔁 ההזמנה הכמה של הלקוח (CTE + ROW_NUMBER + SUM OVER), E28 🔁 JOIN ו־GROUP BY בקוד TS (Map + אגורות, מושווה ל־P17-E12).
    - פרק 18: E26 ✍️ withTransaction generic + transferAll, E27 🔁 batch loader (closure + Map + new Promise, ‏ANY($1)), E28 🔁 שלושת הלקוחות המובילים בכל חודש (GROUP BY + ROW_NUMBER על 200,000 שורות).
    - פרק 19: E26 ✍️ הספרייה כ־schema של Prisma (כתיבת `model`), E27 🔁 עמוד מוצרים (findMany + count ב־Promise.all), E28 🔁 repository לקטגוריות (interface + class + extends Error + switch על P2002/P2025).
    - פרק 20: E26 ✍️ מודול סימניות מקובץ ריק, E27 🔁 slug — regex ב־slugify וב־SlugPipe, E28 🔁 סיכום לקוח משני repositories (tokens + Promise.all + reduce באגורות).
    - פרק 21: E26 ✍️ JWT ביד עם node:crypto (זהה ל־jsonwebtoken, ‏timingSafeEqual), E27 🔁 פירוק header של Authorization (switch + regex + union), E28 🔁 רשימת חסימה לטוקנים (class + Map + שעון מוזרק).
    - פרק 22: E26 ✍️ בדיקות ל־pagination (מוטציות), E27 🔁 מטמון LRU (Map + class + generics), E28 🔁 memoizeAsync עם שעון מוזרק (closure + Map + Promise).
- **בוצע — פרקים 23–30 (בלי 25p ו־29x), סבב 4:** בכל יחידה E26–E28 ו־`expectedExercises: 28`; בפרקים 24, 26, 30 — ‏E31–E33 ו־`expectedExercises: 33`. קובצי התחלה ריקים, קישורים מקופסת התרגול של השיעור המתאים, ו־`tests/_ts.mjs` (מפרק 21) בכל יחידה.
  - **"כתוב את הבדיקות" חוזר כל 2–3 יחידות** (‏`tools/mutation.mjs`, ‏`files/<id>/` עם `mutants.json`, והקוד הנבדק גם ב־`starter/` וב־`solutions/` של המקור): ‏P24-E32 (‏Retry-After, 9 מוטנטים), ‏P25.7-E27 (‏parseSort, 10 — כולל סדר מפתחות שרק `Object.entries` תופס), ‏P26.5-E27 (‏retry/dead-letter, 11), ‏P28-E27 (‏/health, 12), ‏P29-E27 (‏redactPII, 12), ‏P30-E32 (מספר זהות, 10).
  - **נתונים חדשים:** ‏`26w-messaging/files/outbox-next.sql` (‏P26.5-E28), ‏`28w-scale/files/views-days.sql` (‏P28.5-E27, השעות 10–13 UTC כדי שהיום לא ישתנה באזורי זמן אחרים). ה־```out של SQL מולא עם `--fill`.
  - **לקח — הדגמות שמתחברות לשירות:** קובץ הפתרון נטען גם בבודק, ולכן קוד הדגמה בסוף הקובץ רץ בכל בדיקה. ב־P26-E31 (‏Redis) ההדגמה עברה לקובץ `demo.mts` נפרד (פלט אמיתי ב־```term), והפתרון בלי `run`. ‏top-level `await` לא עובר `tsc` (הקובץ נחשב CommonJS) — הדגמות אסינכרוניות בתוך `async function demo() {...}; demo();`. ב־assemble, הדגמה שמתחברת ל־Redis צריכה `REDIS_URL=redis://localhost:6380`.
  - **חדשים:**
    - פרק 23: E26 ✍️ סבב גיבויים (bash), E27 🔁 קורא קובץ .env (indexOf/slice + regex), E28 🔁 כמה מקום תופסים ה־images (switch + reduce + toFixed).
    - פרק 24: E31 ✍️ דוח latency מלוגים של JSON (Map + p95), E32 🔁 בדיקות ל־Retry-After, E33 🔁 התראה על שיעור שגיאות (class + while + שעון מוזרק).
    - פרק 25: E26 ✍️ feature flags עם פריסה הדרגתית (sha256 ← דלי), E27 🔁 formatUptime (‏% + findIndex/slice/filter), E28 🔁 mapLimit (async + closure + while).
    - יחידה 25.5: E26 ✍️ דוח לקוחות ב־MySQL (שני CTE + RANK + DATE_FORMAT), E27 🔁 INSERT מרובה שורות עם upsert (flatMap + regex לשמות), E28 🔁 שאילתה מ־PostgreSQL ל־MySQL (replace עם פונקציה).
    - יחידה 25.7: E26 ✍️ חיפוש מוצרים מ־query string (פילטר Mongo + escape), E27 🔁 בדיקות ל־parseSort, E28 🔁 מה מסתתר ב־ObjectId (parseInt בבסיס 16 + padStart + Date.UTC).
    - פרק 26: E31 ✍️ sessions ב־Redis (MULTI + EXPIRE NX/GT), E32 🔁 לקרוא את INFO (split(/\r?\n/) + fromEntries), E33 🔁 TypedEmitter (generics + keyof, בוחן טיפוסים).
    - יחידה 26.3: E26 ✍️ label selector של Kubernetes (regex + union + switch), E27 🔁 חשבון S3 לפי מדרגות (לולאה עם מצטבר), E28 🔁 סיכום של kubectl get pods (טבלה לפי הכותרת, כמו P23-E28).
    - יחידה 26.5: E26 ✍️ ReorderBuffer<T> (Map + while), E27 🔁 בדיקות ל־decide (retry/DLQ), E28 🔁 האירוע הבא לכל מפתח ב־outbox (SQL: ‏ROW_NUMBER + COUNT OVER).
    - פרק 27: E26 🔥 הראשון שמופיע פעם אחת (Map, ‏O(n)), E27 🔁 מיזוג רשימות ממוינות (while עם שני אינדקסים), E28 🔁 דחיסת רצפים RLE (matchAll + repeat).
    - פרק 28: E26 ✍️ quorum (R + W > N, read repair), E27 🔁 בדיקות ל־/health, E28 🔁 hedged request (new Promise + setTimeout).
    - יחידה 28.5: E26 ✍️ Space-Saving TopK (זיכרון קבוע, ערבויות), E27 🔁 סיכום יומי של צפיות (SQL: ‏COUNT DISTINCT + ROW_NUMBER), E28 🔁 דוח של בדיקת עומס (padStart/padEnd + Intl).
    - פרק 29: E26 ✍️ chunk + retrieve (‏RAG בלי embeddings, ‏\p{L}), E27 🔁 בדיקות ל־redactPII, E28 🔁 תבנית prompt (replace עם פונקציה + Object.hasOwn + <document>).
    - יחידה 29.5: E26 ✍️ שומר לולאה לסוכן (stableKey רקורסיבי), E27 🔁 בודק JSON Schema קטן (union + רקורסיה + נתיבים), E28 🔁 trace כעץ טקסט (Map + רקורסיה + padEnd).
    - פרק 30: E31 ✍️ מטלת בית: key-value עם טרנזקציות מקוננות, E32 🔁 בדיקות לבדיקת מספר זהות, E33 🔁 semver satisfies (23 מקרים שנבדקו מול חבילת semver).
- **✔ המהלך הושלם:** תרגול הכתיבה קיים בכל 37 היחידות הממוספרות (1–30, ועוד 15.5, 25.5, 25.7, 26.3, 26.5, 28.5, 29.5). לא נכללו: פרק 0 והפרויקטים (08p, ‏15p, ‏25p, ‏29x). 
- **✔ בודק לתרגילי התיקון E20–E23 בפרקים 1–4** (16 תרגילים, עם 🤖): הבודק משתמש ב־`tests/_out.mjs` — משווה פלט, ומריץ עותק עם ערכים אחרים (מחיר, קלט, מילה) כדי לתפוס תיקון "במקרה" ובאגים רדומים. בדיקות מבנה ממוקדות: `let`/`const` נכונים, בלי `var`, ‏`toFixed` רק בהדפסה, `===` בתנאי. E21/E23 בפרק 3 רצים על טבלת מקרים מלאה.
- אפשר להמשיך (לא תוכנן): "מסלול חזרה" מרוכז.

### 7.6 עדכון 11–16.11.2026 — תרגול בסוף כל שיעור
- **ההחלטה (אפיון 6.1, "שינוי 3"; נספח ב׳ #9):** לכל שיעור דף תרגול משלו, בסוף השיעור. **🎯 חלק 1** — רק השיעור (יעד 14: ‏6 הבנה + 8 קוד). **🔗 חלק 2** — השיעור יחד עם שיעורים ופרקים קודמים (יעד 6: ‏3 הבנה + 3 קוד), ובכל שאלה שורת `<p>🔗 <strong>איך זה מתחבר:</strong> …</p>`. כ־20 שאלות לשיעור **כולל** התרגילים הקיימים; משבצת שכבר מלאה — נשארת; תמיד חלק 2 ≥ 5 והבנה בחלק 1 ≥ 4.
- **בבנייה (`course-src/build.mjs`: ‏`placeExercise`, ‏`exercisesPages`):**
  - לכל שיעור: `practice-N.html` (שאלות, הבנה לפני קוד בכל חלק, עם תגיות 🧠 הבנה / 💻 כתיבת קוד 🤖 ושורת ספירה) ו־`practice-N-solutions.html` (רמזים, פתרון, טעויות).
  - `exercises.html` ו־`solutions.html` — תוכן עניינים לפי שיעור, וסקריפט שמעביר קישור ישן `exercises.html#P01-E07` לדף התרגול הנכון (`practice-3.html#P01-E07`).
  - בשיעור: קופסאות `box practice` ("✍️ עכשיו בדף התרגילים") נמחקות, וקישורי `exercises.html#ID` מופנים לדף התרגול; בסוף השיעור נוספת קופסה אחת "✍️ סיימת את השיעור? עכשיו תרגול" עם מספר השאלות בכל חלק.
  - **שיבוץ:** `@lesson`/`@part` אם יש; אחרת לפי עמודת "שיעור" בכותרת — שיעור אחד ← חלק 1 שלו; כמה שיעורים או "כל הפרק" ← חלק 2 של האחרון. **סוג:** `@kind understand`, אחרת "קוד" אם יש `tests/<ID>.test.mjs` או רמה ≥ 2.
  - **קוד בתוך משפט:** `white-space: nowrap`; ‏`<code>` ארוך מ־60 תווים מקבל `class="long"` (בשורה משלו), ומ־26 — `class="mid"` (בשורה משלו רק במסך צר). **כלל כתיבה:** קוד inline ארוך מ־~60 תווים — לגדר קוד (```ts / ```sql / ```text), לא `<code>` בתוך משפט.
- **איך מוסיפים שאלה:** מזהה חדש אחרי המקסימום ביחידה (מזהים קיימים לא משתנים); שורות `@lesson N`, ‏`@part 1|2`, ולשאלת הבנה `@kind understand`; כותרת בלי `|`. לשאלת קוד: `starter/<ID>.ts` (או `.sql`) עם הערה בלבד — המשימה והחתימה (`// כתוב וייצא:` …); פתרון ב־```ts save=solutions/<ID>.ts (או ```sql run db=… save=… עם ```out ? ← `--fill`); בודק `tests/<ID>.test.mjs` עם כמה קלטים, מקרי קצה והודעות assert בעברית — נכשל על ההתחלה ועובר על הפתרון. בפרקי AI: `fakeClaude`/`fetch` מדומה או תלות מוזרקת, אף פעם לא מודל אמיתי. Redis/PostgreSQL: ‏`redisSandbox`/`sandbox` (מנקים לבד; ‏`database: true` ב־chapter.mjs כשיש בודק SQL). אחר כך `expectedExercises`, ‏`--verify <prefix>`, ובסוף `node course-src/scripts/make-readme.mjs`.
- **לקחים:** ב־`t.after` הסדר הוא סדר הרישום — חיבור מ־`db.pool()` שמשתחרר ב־`t.after` שנרשם אחרי ה־sandbox תוקע את `pool.end()`; משחררים בגוף הבדיקה. ‏timing בבדיקות — עם מרווח (‏`delayMs` של 20 ולא 1). מספרים צפויים בבודק — מחשבים ביד וגם מוודאים מול הפתרון (כמה טעויות חשבון נתפסו כך).
- **✔ הושלם בכל היחידות הממוספרות 1–30** (כולל 15.5, ‏25.5, ‏25.7, ‏26.3, ‏26.5, ‏28.5, ‏29.5): commit לכל יחידה ("‎<יחידה>: N שאלות תרגול חדשות בסוף כל שיעור"). אחרון: פרק 29 (‏E29–E100), יחידה 29.5 (‏E29–E100), פרק 30 (‏E34–E120, ‏6 שיעורים × 20). README: ‏3,353 תרגילים, ‏1,860 בדיקות.
- **לא נכלל:** פרק 0 והפרויקטים (08p, ‏15p, ‏25p, ‏29x). בפרק 9 — תרגילי ה־Terminal הישנים עדיין בלי בודק.

#### 7.6.1 עדכון 19.11.2026: ביקורת מערך התרגול ואכיפה אוטומטית (ענף `claude/practice-quality`)
- **תוקן:**
  - `inline()` כבר לא מעבד backticks בתוך `<code>…</code>` שנכתב ביד. היו 267 מקרים של `<code>` מקונן, ובהם template literals הוצגו בלי ה־backticks.
  - 🤖 נוסף ל־P26.3-E35.
  - נוספו 8 שורות 🔗 בחלק 2.
  - "ידע נדרש" עודכן ב־72 שאלות של חלק 2, עם `@lesson` מפורש ובלי שינוי בשיבוץ (`idToPage` זהה לפני ואחרי).
  - 6 טבלאות נעטפו ב־`.table-wrap`.
  - בפרק 9 נוסף `checker: true`, וקופסת 🧰 עודכנה: "שאלות עם 🤖 = בודק".
  - כפילויות מכוונות סומנו `@type review`, עם שורת `<p><strong>🔁 חזרה:</strong> …</p>` שמפנה לגרסה הקודמת.
- **החלטות:**
  - שאלות בחלק 1 עם שורת 🔗 (6) או עם "פרק X" ב"ידע נדרש" (51) נשארות בחלק 1. הפרק הנוסף נחשב רקע.
  - ל־P08-E26, ‏P08-E34 ו־P08-E37 נשאר ה־`@type` הקיים. לכל תרגיל יש רק `@type` אחד.
- **אכיפה בבנייה** (`lintPractice` ו־`lintPage` ב־`course-src/build.mjs`): הבדיקות רצות בכל בנייה, גם בלי `--verify`.
  - **שגיאה (`STRICT`), מכשילה את הבנייה:**
    - `test-no-robot`: יש `tests/<ID>.test.mjs` ואין 🤖 בכותרת.
    - `orphan-test`: יש בודק ואין לו תרגיל, חוץ מבודקי פרויקט `PR*`.
    - `checker-flag`: יש בודקים ואין `checker: true`.
    - `understand-test`: שאלת הבנה עם בודק.
    - `explicit-lesson`: "ידע נדרש" מזכיר פרק ואין `@lesson`. בלי `@lesson`, ‏`placeExercise` סופר את מספר הפרק כמספר שיעור.
    - `link-line`: שאלה בחלק 2 בלי שורת 🔗.
    - `part2-requires`: שאלה בחלק 2 שה"ידע הנדרש" שלה הוא רק השיעור הנוכחי. צריך לציין בו פרק אחר, שיעור אחר, טווח שיעורים או "כל הפרק".
    - `balance`: בכל שיעור, חלק 2 כולל לפחות 5 שאלות, וחלק 1 כולל לפחות 4 שאלות הבנה.
    - `nested-code`: ‏`<code>` בתוך `<code>` בדף בנוי.
    - `table-wrap`: ‏`<table>` בלי `<div class="table-wrap">` בדף בנוי.
  - **אזהרה בלבד:** מודפסת שורת סיכום. הרשימה המלאה מוצגת עם `node course-src/build.mjs --warnings`. המצב ב־19.11:
    - `robot-no-test` ‏(3): ‏P14-E72 עד E74. **כשסוכן הבודקים יכתוב את הבודקים שלהם, להעביר את הכלל ל־`STRICT`.**
    - `missing-field` ‏(88): ‏80 בלי `@mistakes`, ו־8 בלי `@hint2`.
    - `understand-explained` ‏(25): פתרון של שאלת הבנה בלי משפט הסבר.
    - `code-test` ‏(23): ‏17 תרגילי Terminal בפרק 9 (חריג מכוון), ‏P14-E72 עד E74, ו־P15.5-E04, ‏E05 ו־E10.
    - `level4` ‏(51): שיעורים בלי תרגיל ברמה 4. אזהרה קבועה, כי זה לא כלל חובה באפיון.
  - **הכלל להוספת כללים:** כלל חדש נכנס ל־`STRICT` רק כשאין לו אף הפרה קיימת. עד אז הוא אזהרה. רשימת המשימות של exercise-coach (סעיפים `missing-field`, ‏`understand-explained`, ‏`level4`, כפילויות לא מכוונות ו־15.5) נמסרה בנפרד. כשכלל מגיע ל־0 הפרות, מעבירים אותו ל־`STRICT`.
- **ידע מוקדם: עוד לא נאכף.** regex, ‏`new Date`, ‏`keyof` ו־generators משמשים בתרגילים לפני שנלמדו. בשבוע הקרוב יתווספו לשיעורים סעיפים על regex, ‏Date ו־keyof. אחרי זה אפשר להוסיף ל־build.mjs טבלת `TAUGHT_AT` (מונח ← היחידה והשיעור שבהם נלמד), כאזהרה `prior-knowledge` על `solution`, ‏`hint1` ו־`hint2`. עדיף טבלה מפורשת על grep, כי למשל `new Date` מופיע בשורת לוג ב־08-1, ונלמד רק ב־24-2.
- **מחוץ לבנייה, בסקריפט ביקורת:** כפילויות חתימה וקוד inline ארוך מ־60 תווים. הבדיקות האלה רועשות מדי בשביל הבנייה.

### 7.7 עדכון 19.11.2026 — ידע שהתרגול משתמש בו ולא נלמד
- **הפער (ביקורת תרגול):** regex ב־239 תרגילים (הראשון P12-E19) ולא נלמד; `new Date` ב־52 תרגילים לפני פרק 24 (הראשון P07-E60); `keyof` ב־6 (הראשון P11-E25); generators ב־5. **ההחלטה (אפיון נספח ב׳ #10):** להוסיף לשיעורים, לא לשכתב פתרונות.
- **Date** — פרק 7, שיעור 3, סעיף 6: רגע כמספר (`getTime`), ISO ו־`Z`, חישובי ימים, `getUTC...` וחודש מ־0, `Date.UTC` וגלישה (30.2 ← 2.3), תאריך ב־JSON, ‏Invalid Date (`RangeError: Invalid time value` רק ב־`toISOString`). איור ציר זמן. שאלות P07-E81–E85 (`expectedExercises: 85`); הבודק של E84 מחליף `process.env.TZ` בזמן ריצה (UTC, ירושלים, לוס אנג׳לס, קיריטימטי) — נבדק שפתרון עם `getDate/setDate` נכשל. פרק 24 שיעור 2 מפנה אחורה.
- **regex** — פרק 8, **שיעור 5 חדש** (`lesson-05-regex.html`, בסוף הפרק כדי שמספרי השיעורים ודפי התרגול לא יזוזו): test, אבני בניין ועוגנים, match/groups/named groups/`(?:)`, ‏`g` ו־matchAll, replace (`$1`, פונקציה), split, ‏`new RegExp` + escaping, ‏`\p{L}` עם `u`, ‏`\b` לא עובד בעברית (גילוי 26), ‏`lastIndex` עם `g`, מתי לא. איור פירוק של `/^05\d-?\d{7}$/`. שאלות P08-E81–E100 (20 שאלות, בתקן 7.6) (`expectedExercises: 100`). P08-E24/E25 ("כל הפרק") קיבלו `@lesson 4`/`@part 2` כדי לא לעבור לדף של שיעור 5. ההפניות בפרק 3 ("נלמד בפרק 13") תוקנו.
- **keyof** — פרק 11, שיעור 3, סעיף 5: `keyof`, ‏`T[K]`, ‏`K extends keyof T`, ‏`keyof typeof`, הצצה ל־mapped types, ‏`Object.keys` ← `string[]` (TS7053). שאלות P11-E81–E85 (`expectedExercises: 85`).
- **generators** — **נלמדים מ־20.11.2026** (אפיון נספח ב׳ #11): יחידה 28.5, שיעור 2, **סעיף 4 חדש** (`<h2 id="generators">`, אחרי קופסת "גם async יכול להעמיס"): `function*`/`yield` ו־`next()` (‏`{ value, done }`, הגוף לא רץ עד `next`), ‏`for...of`/spread ו"פעם אחת בלבד", סדרה אינסופית + `break` ← `return()` ← `finally`, ‏`async function*` + `for await` על API עם עמודים (העמוד הבא נטען רק כשצריך), ‏`Readable.from`. טעויות נפוצות: ‏`yield` בתוך callback (‏TS1163), ‏`for...of` על async generator (‏TS2488; בזמן ריצה `TypeError: … is not iterable`). איור 2: ‏next/yield בתורות. 4 דוגמאות `run` + 2 `tsc`, פלט מ־`--fill`. מילון: Generator, ‏Async generator; ‏passTest ו־goals עודכנו; ‏minutes של שיעור 2: ‏45←65. הפניות אחורה: 28.5 שיעור 3 (לפני E64) ו־29.5 שיעור 5 (ליד E19) מקשרים ל־`../28w-scale/lesson-02-event-loop.html#generators`. **לא שונו תרגילים:** E51 כבר `@lesson 2`, ‏E64 ‏`@lesson 3`, ‏P29.5-E19 בשיעור 5 — כולם אחרי הסעיף. P28.5-E65 ו־E69 נשארים בלי generators. אין עדיין שאלות תרגול ייעודיות לסעיף (אפשר להוסיף דרך exercise-coach).
- **לקח:** הוספת שיעור בסוף פרק משנה את השיבוץ של תרגילים בלי `@lesson` ("כל הפרק", או מספר שיעור שעכשיו בטווח) — לבדוק לפני ואחרי ולנעוץ `@lesson`/`@part`.

### 7.8 עדכון 20.11.2026 — ביקורת בודקים: מוטנטים, נתונים נסתרים ורמזים
**הבעיה (ביקורת `checker-auditor`):** 115 מתוך 175 בודקים שנבדקו "עברו" על פתרון שגוי סביר (66%). ב־SQL ‏57 מתוך 66 עברו על "תשובה מועתקת" (‏`SELECT … FROM (VALUES …)`), כי הנתונים קבועים והבודק הדפיס את כל השורות הצפויות.

**הכלים (`course-src/root/tools/`):**
- `rows.mjs` — ‏`assertSameRows(got, expected, label)`: במקום "ציפינו: <כל השורות>" — רמז אחד: "חסרות 2 שורות", "יש שורה שלא אמורה להופיע (למשל …)", "הסדר שגוי מהשורה 3", "העמודה X שונה בשורה Y". גם `splitSql` ו־`parseVariants`. **אסור להציג ללומד את כל השורות הצפויות.**
- `sql.mjs` — ‏`sameAsSolution(t, import.meta.url, "P16-E08.sql", { seed, changes, after })`: מריץ את הקובץ והפתרון על ה־seed, על כל קטע ב־`files/<seed>.variants.sql` (‏`-- @variant`), ועל `changes`. בקטעים הנסתרים השורות מוזזות פיזית (UPDATE בלי שינוי) — כך `ORDER BY` חסר נתפס. אם הפתרון עצמו משנה סדר כשהשורות זזות — הסדר לא נבדק (תיקו). `after` — לקובץ שבונה טבלה בעצמו: SQL אחרי הקובץ, ואז הפקודה האחרונה רצה שוב. ‏`sandbox.pool()` מסמן `application_name`, ובסוף הבדיקה מנתק חיבורים שלא שוחררו (בלי זה בודק נתקע דקות).
- `mysql.mjs` — אותו `sameAsSolution` מול MySQL (בלי הזזה פיזית: InnoDB מסודר לפי המפתח). DuckDB — `28w-scale/tests/_duck.mjs`, ‏`sameAsSolution(file)`: טבלה מ־`orders.parquet` בסדר מעורבב + `files/orders.variants.sql`.
- קובצי variants: ‏`16-sql/files/shop.variants.sql`, ‏`17-relations/files/store.variants.sql`, ‏`25v-mysql/files/shop.variants.sql`, ‏`27-algorithms/files/interview.variants.sql`, ‏`28w-scale/files/orders.variants.sql`, ‏`30-career/files/sales.variants.sql`. בכל אחד: שורות על הגבולות, שם כפול, שינויים בשורות קיימות, ומחיקה. **כשמוסיפים שאלת SQL — לוודא שהפתרון עובר על כל הקטעים** (למשל `INSERT` של קטגוריה שכבר קיימת בקטע — כך נשבר P17-E38 בהתחלה).
- `load.mjs` — ‏`lint(testUrl, file)`: ESLint עם `eslint.config.mjs` של הקורס (P08-E23). ‏`eslint`, ‏`@eslint/js` ו־`globals` נוספו ל־`course-src/package.json` לאימות.
- `_src.mjs` (פרקים 5–8) — ‏`assertUnchanged(fn, args)`: הקלט לא השתנה.
- "במקביל" נמדד בלי שעון: עוטפים את `fsp.readFile` לפני טעינת הקובץ (ו־`syncBuiltinESMExports`) וסופרים קריאות פתוחות (P10-E14, ‏P13-E28, ‏P14-E73), או בודקים סדר התחלה/סיום ("start 2" לפני "end 0") במקום סף זמן (P10-E24, ‏P25-E12, ‏P29-E19).

**מוטנטים כרגרסיה:** `course-src/chapters/<unit>/tests/mutants/<ID>/<שם>/` — הקבצים מחליפים את `solutions/` (קובץ `_DELETE` — רשימת קבצים למחיקה). ‏`build.mjs --verify` מריץ כל מוטנט וחייב שהבודק **ייכשל** עליו ("עובר על המוטנט … — הבודק אמור להיכשל"). התיקייה לא מועתקת ל־`backend-course`. בפרויקט Nest (‏`nestProjects`) העותק של המוטנט מקומפל מחדש, כי הבודק מריץ `dist`. מוטנט שמתברר כ"שקול" (אותה התנהגות) — מוחקים, לא "מתקנים" את הבודק (דוגמאות: ‏`COUNT(DISTINCT product_id)` כשיש PK על (order_id, product_id); ‏`MaxLength(254)` כש־`IsEmail` כבר בודק; ‏`sort` בלי tie-break ב־GNU sort).

**כללים לכתיבת בודק (מעכשיו):**
- כל פרמטר בחתימה מקבל לפחות שני ערכים; כל קבוע במשימה מוחלף ב־`changes` (פרקים 1–4).
- לכל טווח במשימה — שני הקצוות ומעבר לשניהם (0/1, ‏50/51, ‏2.5).
- נתונים שמבחינים: שם כפול, תיקו במיון, ids לא רציפים, float שלא מתעגל במקרה (1.15−1.13), הרבה מפתחות שונים בבדיקת ביצועים.
- דרישת טכניקה ("Map", "בלי sort", "בלי לבדוק מראש", "ESLint נקי") — בדיקת קוד, ספירת שאילתות (`log` של Prisma) או `lint()`.
- בודק לא נתקע: timeout משלו כשהוא תלוי ב־timeout של הלומד (P14-E21, ‏P25-E10), ‏`withTimeout` כשחיבור עלול לא להשתחרר (P18-E14), ו־`new Promise(() => {})` במקום `sleep(5000)` כדי שהתהליך ייסגר.
- מרוץ: לא לסמוך על מזל. P18-E14 משהה כל SELECT ב־15ms דרך pool עטוף — בלי `FOR UPDATE` יותר מ־5 נרשמים בכל הרצה.
- זמנים: סף יחסי למחשב (P28.5-E24: ‏`max(50ms, 0.75 × שאילתה בלי cache)`, עד 3 סבבים) או סדר אירועים (P28.5-E55: ‏`/health` ענה לפני שהדוח הסתיים) — לא סף קבוע בלבד.
- **`robot-no-test` עבר ל־STRICT** (P14-E72–E74 קיבלו בודקים).

**תוכן שתוקן:** P03-E21 — "18 ומעלה" במשימה ובקובץ ההתחלה, ובדיקה לגיל 18. ‏P12-E16 — הפתרון מצרף כמויות של אותו מוצר ודוחה כמות שאינה שלם חיובי (`ValidationError("qty", …)`); המשימה וקובץ ההתחלה מציינים זאת. ‏P22 — ‏`mutants.json` של E08/E09/E10/E12 קיבלו מוטנטים לכל דרישה, ופתרונות ה־spec עודכנו.

**סריקה מלאה 18–30 (20.11.2026, אחרי הדגימה):** כל בודק 🤖 ביחידות 18–30, בחצאי־היחידות (25.5, ‏25.7, ‏26.3, ‏26.5, ‏28.5, ‏29.5; אין 19.5) ובפרויקטים 25p ו־29x — קיבל לפחות מוטנט אחד ב־`tests/mutants/`, חוץ מ־PR2-TESTS (פרויקט Jest כבד; נבדק ידנית). שיטת העבודה, שכדאי לחזור עליה כשמוסיפים בודקים:
1. מוטציה אוטומטית של הפתרון: הסרת `throw`/תנאי שמירה, ‏`<`↔`<=`, ‏`===`↔`!==`, ‏`&&`↔`||`, ‏`await` חסר, ‏`trim`/`toLowerCase`/`Math.round` חסרים, ‏`sort`/`filter` חסרים, ‏`BEGIN`/`ROLLBACK` חסרים, אופרטורים ב־SQL וב־Mongo, הסרת שורה ב־YAML/Dockerfile/sh, והסרת בלוק `it` ב־spec. מוטנט שנתפס — נשמר כ־`auto-<op>`; מוטנט ששרד — נבדק ידנית.
2. לבודק בלי מועמדים אוטומטיים — 2–3 מוטנטים ידניים לפי נוסח המשימה (בעלות, הרשאה, גבולות, תיקו, מקביליות, `release` חסר).
3. ששרד: **אם הוא שקול — לא שומרים** (השוואה במיון `<` מול `<=`, גבול לולאה שקורא `undefined`, ‏`ORDER BY` חסר כשהסדר נקבע ממילא ע״י PK ב־InnoDB או ע״י GROUP BY, גוף בתשובת 204, ‏`ENV NODE_ENV` שהמשימה לא דורשת, קוד הדגמה ב־`main`). אחרת — מחזקים את הבודק ושומרים את המוטנט.

**חיזוקים חוזרים שהסריקה הוסיפה:** גבולות זמן ("בדיוק ב־since", ‏1.1 בחצות UTC), אורך סוד 32/31, ‏`attempts` נספר (מספר בקשות לשרת מדומה), תיקו במיון עם **סדר פיזי אחר** (`UPDATE … SET x = x`), ‏Proxy על client (סופר `$queryRaw`/`set`, או "מפיל" את המסד ← 503), ‏`within(p, ms, msg)` עם `clearTimeout` במקום `Promise.race` עם טיימר שמשאיר את התהליך חי, ומעקב אחרי `setInterval` גלובלי בבדיקה שמוטנט עלול להשאיר בה טיימר (P26.5-E67).

**נתונים נסתרים חדשים:** ‏`18-consistency/files/bank.variants.sql` (קטן; ‏`sameAsSolution` עם `base: false, shuffle: false` — אחרת 12 שניות), ‏`28w-scale/files/views-days.variants.sql` (‏P28.5-E27), ‏`25v-mysql/files/basics.variants.sql` (‏P25.5-E36, דרך `sameAsSolution` של `tools/mysql.mjs`). ל־`sameAsSolution` של PostgreSQL נוספו `base` ו־`shuffle`. אינדקס בסדר עמודות שגוי: ב־PostgreSQL 18 (skip scan) עדיין "Index Scan" — בודקים מספר דפים שנקראו ב־`EXPLAIN (ANALYZE, BUFFERS)`.

**מה נשאר פתוח:** מוטנטים שלא נבדקים בלי בדיקה שבירה — השוואת זמנים ב־login (dummy hash, PR3-AUTH), החזר כספי בביטול (PR3-PAY; אין דרך לראות מבחוץ), עדכון מנהל קיים בעלייה חוזרת (PR3-AUTH), תשלום כפול במקביל עם מפתחות שונים (PR3-PAY — הבדיקה נוספה, אבל המרוץ לא משתחזר), ו־טרנזקציה ב־contract של P25-E67. הבודקים של פרויקט 3 לוקחים 10–20 שניות כל אחד (עליית Nest + bcrypt) — מעל הכלל של 10 שניות.

**חריג מאושר:** בודקי פרויקט 3 (‏`25p`, ‏PR3-*) רשאים לרוץ 10–20 שניות כל אחד — המשתמש אישר; אין לקצר אותם על חשבון הכיסוי. **PR2-TESTS נשאר בלי מוטנט — בהחלטה** (פרויקט Jest כבד, נבדק ידנית); לא לסמן אותו כחוסר.

**קובץ חסר בפרויקט (‏08p, ‏15p, ‏25p, ‏29x):** ‏`load(testUrl, file, { step, exports })` ב־`tools/load.mjs` לא זורק `ERR_MODULE_NOT_FOUND` גולמי: "לא נמצא src/ingest.ts — צור אותו לפי הדרישות בשלב 1 ויצא ממנו createIngestServer(…)", "src/x.ts מייבא את src/y.ts, שלא נמצא", ו"החבילה express לא מותקנת — הרץ npm install". ב־29x הרמזים בטבלה `HINTS` ב־`tests/_events.mjs`; ב־`startApp` (‏`tools/app.mjs`) — ‏prisma חסר ← "הרץ npm install", ו־`dist/main.js` חסר ← "npm run build". בודק פרויקט חדש — להעביר `{ step, exports }`.

### 7.9 עדכון 20.11.2026 — השלמת מערך התרגול (סוכן `exercise-coach`, ענף `claude/practice-quality`)
- **אזהרות לפני ← אחרי:** ‏`missing-field` ‏88 ← 0, ‏`understand-explained` ‏25 ← 0, ‏`level4` ‏51 ← 0, ‏`code-test` ‏20 ← 17 (רק תרגילי ה־Terminal של פרק 9, חריג מכוון).
- **עברו ל־`STRICT`:** ‏`missing-field`, ‏`understand-explained`, ‏`level4`. מעכשיו: כל תרגיל חייב `@hint1`, ‏`@hint2` ו־`@mistakes`; פתרון של שאלת הבנה חייב משפט "למה" (‏`hasExplanation`); ובכל שיעור חייב להיות תרגיל ברמה 4.
- **טעויות נפוצות (80) ורמז 2 (8):** הליבה הישנה (E01–E25) של 26c, ‏26w, ‏28w ו־29w. רמז 1 מכוון לאזור, רמז 2 לסיבה, בלי הפתרון.
- **"למה" ב־25 שאלות הבנה:** פסקה `<p><strong>למה:</strong> …</p>` אחרי הפלט (הקוד והפלט לא השתנו).
- **51 תרגילי תיקון חדשים (רמה 4), אחד לכל שיעור שלא היה בו**, כולם 🤖, בחלק 1 של השיעור (`@lesson`/`@part 1`), עם מזהים חדשים ו־`expectedExercises` מעודכן. בכל אחד: קובץ התחלה עם 3–4 תקלות אמיתיות, פתרון עם הסבר לכל תקלה, ובודק שנכשל על ההתחלה. רשימה: ‏P01-E65, ‏P02-E81, ‏P03-E81, ‏P05-E81, ‏P06-E81, ‏P07-E86, ‏P09-E81, ‏P10-E83, ‏P13-E81, ‏P14-E83–E84, ‏P15-E81, ‏P15.5-E81–E83, ‏P16-E81, ‏P17-E81–E82, ‏P19-E89–E91, ‏P20-E84–E85, ‏P21-E101, ‏P22-E102–E103, ‏P23-E102–E103, ‏P24-E121, ‏P25-E102–E103, ‏P25.5-E101, ‏P25.7-E101–E102, ‏P26-E121–E123, ‏P26.3-E102–E103, ‏P26.5-E101, ‏P27-E103–E104, ‏P28-E101–E102, ‏P28.5-E101, ‏P29-E101–E102, ‏P29.5-E101–E102, ‏P30-E121–E122.
  - סוגים: קוד JS/TS עם `load`/`exportsOf`; ‏SQL עם `sameAsSolution` ו־`changes` (‏P16-E81 מציג את שלוש השגיאות של psql בסבבים, מהרצה אמיתית); ‏Prisma schema עם `fromSchema`/`columns`; ‏Nest עם `nestApp`; סקריפטי shell עם `fakeDocker`; ‏workflow עם `readWorkflow`; ‏Redis ו־Mongo עם ה־sandbox; מסמכים (פרק 30) עם `_docs.mjs`.
  - בפרק 22 התיקון הוא **בבדיקות עצמן**: ‏P22-E102 (‏node:test, ‏`checkSpec`) ו־P22-E103 (‏Jest, ‏`checkJestSpec`), עם `files/<ID>/mutants.json` (אותם מוטנטים כמו E57 ו־E74).
- **כפילויות שגוונו (המזהים נשארו):** ‏P05-E33 ← `rectangleArea(width, height)` (חימום של שיעור 1); ‏P05-E54 ← `wordCount` + ‏`isLongerThan(text, limit = 10)` (‏guard clause וברירת מחדל, בלי split); ‏P22-E55 ← `invalidCases(valid, bad)` (גופים לא תקינים לבדיקות HTTP, במקום builders כמו E16). קובצי התחלה ובודקים חדשים.
- **15.5:** ‏P15.5-E04, ‏E05 ו־E10 קיבלו 🤖, קובצי התחלה ב־`starter/` (‏`P15.5-E04-profile.html`, ‏`P15.5-E05-profile.css`, ‏`P15.5-E10-shop/`) ובודקים: HTML ו־CSS סטטיים (`parseHtml`, ‏`declsFor`), ו־E10 מריץ את `app.js` מול `fakeDocument` ו־fetch מדומה. המשימות מציינות עכשיו את השמות שהבודק מחפש (`main.card`, ‏`.tags`, ‏`.actions`, ‏`#q`, ‏`#status`, ‏`#results`).
- **לקחים:** ‏`app.js` בלי import/export נטען כ־CommonJS, ו־`import("…?run=2")` מחזיר את המודול מה־cache בלי להריץ שוב — הבודק של E10 מעתיק אותו לקובץ `.mjs` חדש בכל בדיקה. ‏`expectedExercises` מעדכנים לפי הערך הקודם ועוד מה שנוסף, לא לפי ספירת `^@@` (בפרק 9 יש שורות `@@` של diff בתוך term). פלט של `git log --stat --format=%s` כולל שורה ריקה אחרי כל כותרת.
- **README:** ‏3,434 תרגילים, ‏1,934 בדיקות.
- **פתוח:** תרגילי ה־Terminal של פרק 9 (17) עדיין בלי בודק; ‏generators (‏P28.5-E51, ‏E64, ‏P29.5-E19) — ההחלטה מ־7.7 עדיין פתוחה.

---

## 8. כללי סגנון (לשמור על אחידות)

- **עברית פשוטה**, פנייה בלשון זכר ליהודה ("אתה"). מונחים באנגלית ב־backticks. מקף עברי (־) בצירופים: `ה־API`.
- **כל שיעור כולל:**
  - קופסת 🎯 בתחילתו.
  - איור SVG אחד לפחות. משתמשים במשתני הצבע `--accent`, `--green`, `--purple`, `--amber`, `--red`, `--muted`, ובגרסאות `-soft` שלהם, ו־`--svg-fill`, `--svg-stroke`.
  - קופסאות `tip` / `warn` לפי הצורך.
  - קופסת practice בסוף.
  - בשיעור האחרון: קופסת 💼 job.
- **בכל פרק:** קופסת 🧰 עם קישורים רשמיים ל־Mac, פקודת בדיקה, ו־`copyStep(slug)`.
- **הודעות שגיאה ופלטים — אמיתיים בלבד** (בהרצה או בבדיקה בדפדפן).
- **נתוני SQL באנגלית.** כל ההסברים בעברית.
- **פתרונות:** מסבירים *למה*, וכוללים "טעויות נפוצות".
- **בדיקות:** הודעות assert בעברית. מספרים מחושבים מהנתונים, לא מנוחשים — כשלא בטוחים, מריצים.
- **שמות פרויקטים בתיקיות:** `~/dev/tasks-api` (פרויקט 2), `~/dev/expenses-cli` (פרויקט 1).

---

## 9. סוכנים, סקילים וזיכרון

- **סוכנים (מ־9.11.2026):** ב־`.claude/agents/` של המאגר יש ארבעה סוכני ביקורת (ראה 7.4). מריצים את שלושת הבודקים במקביל, ואז את `agents-manager` על הדוחות שלהם. אין סקילים. כל העבודה נעשתה ישירות עם הכלים הרגילים (קבצים, טרמינל, דפדפן מובנה לבדיקות ויזואליות ו־CORS).
- **זיכרון:** הייתה הערת זיכרון אחת בחשבון הקודם (`backend-course-project`). זה התוכן שלה:
  - **מה:** קורס Backend בעברית ליהודה, שהתחיל ב־2026-10-31. התיקייה `/Users/yeuda/Desktop/Backend`, שקודם נקראה "קורס בBackend".
  - **פלט ותוכן:** הפלט ב־`backend-course/`. בכל פרק: קופסת 🧰, איורי SVG, 25 תרגילים, דף פתרונות נפרד.
  - **מבנה:** פרק 0 נכתב ביד, והשאר נבנים מ־course-src.
  - **קורס נפרד:** קורס C# הוא קורס נפרד, לא בתחום.
  - **איך ליישם:** לשמור על אותו מבנה, ולהריץ כל דוגמה.
  - כדאי לשמור אותו גם בזיכרון של החשבון החדש.

---

## 10. איך להמשיך — צ'קליסט ל־Claude החדש

1. **לקרוא:**
   - את המסמך הזה.
   - את האפיון, סעיפים 7–14.
   - פרק לדוגמה: `course-src/chapters/19-prisma/` — chapter.mjs, שיעור, `exercises.txt`, בדיקה, `tests/_shop.mjs`.
   - פרק 20: `course-src/chapters/20-nestjs/` ו־`course-src/root/tools/nest.mjs`.
2. **להריץ** `node course-src/build.mjs --verify 19`, כדי לוודא שהסביבה עובדת (PG פרטי על 5433 עולה לבד).
3. ~~כל הפרקים והפרויקטים~~ ✔ הושלמו. **הקורס גמור** — ראה 7.1 למה שאפשר להמשיך. (סעיף 7.1–7.2). בענן: קודם `bash course-src/scripts/cloud-setup.sh` (אחרי הפסקה ארוכה הקונטיינר נעצר — הסקריפט מעלה אותו מחדש), ואז `export PATH=/opt/node24/bin:$PATH`.
4. **להמשיך לפרק 26 והלאה**, כל פרק שלם (שיעורים + תרגילים + פתרונות + בדיקות + אימות) לפני הבא.
5. **מדי כמה פרקים** — אימות מלא, ועדכון המסמך הזה (סעיפים 6–7).
