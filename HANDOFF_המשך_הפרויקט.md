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
- כל שיעור מסתיים בקופסת "✍️ עכשיו בדף התרגילים" עם קישורים לתרגילים (`exercises.html#P16-E06`). בסוף הפרק: קופסת 💼 "בעולם העבודה".

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
  - Node בענן: 22.x (כמו במק — הבודק מוסיף strip-types לבד).
- **התקנות npm:** בוצעו ב־`course-src` (לאימות). גם `course-src/root/package.json` עודכן (מה שהלומד מתקין).

---

## 6. מה בוצע — פרק אחר פרק

| פרק | slug | מה יש | בודק |
|---|---|---|---|
| 0 | `00-setup` | 5 שיעורים, נכתב ביד ישירות ב־backend-course (כולל דף הבית ומילון) | — |
| 1–4 | `01-values-variables` … `04-loops` | ערכים, אופרטורים, תנאים, לולאות. ⚡ מבחני כניסה | בלי בודק |
| 5–7 | `05-functions`, `06-arrays`, `07-objects` | ⚡ | הבודק מתחיל בפרק 5 |
| 8 | `08-modules-errors` | modules, שגיאות, debugger, ESLint | ✔ |
| פרויקט 1 | `08p-project-expenses` | מנהל הוצאות CLI. שלבים 0–4 + reference. בדיקות PR1-LOGIC/STORAGE/CLI | ✔ |
| 9 | `09-git` | Git ו־GitHub. `files/scenarios.mjs` יוצר מאגרי תרגול | בלי בודק |
| 10 | `10-async` | | ✔ |
| 11 | `11-typescript` | `.ts` עם בדיקות `typecheck` | ✔ |
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
- **השלבים שנשארו** (לפי האפיון):
  - פרק 21 — משתמשים, JWT והרשאות ("משתמש רואה רק את שלו").
  - פרק 22 — בדיקות.
  - פרק 23 — Docker.
  - פרק 25 — פריסה.

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
   - פרויקטים הם CommonJS, מקומפלים עם tsc (`experimentalDecorators`, `emitDecoratorMetadata`).
   - בדיקות Jest 30.
   - TypeScript ^6 בתבנית.
   - קובץ ה־AGENTS.md בתבנית מקדם שירות בתשלום — **לא להכניס לקורס**.
8. **באג שתוקן ב־build:** ב־`--fill` משתמשים ב־replace עם פונקציה, כי `$'` בקוד (regex) גרם להכפלת הקובץ.
9. **פקודת `rm -rf` על התיקייה הנוכחית נחסמת** על ידי מנגנון הבטיחות. לא מוחקים את ה־cwd.

---

## 7. מה נשאר לעשות

### 7.1 הצעד הבא המיידי — פרק 21 (כניסה והרשאות) + פרויקט 2 שלב ד׳
פרק 20 **הושלם** (ראה סעיף 6). נקודות שנלמדו בדרך ושכדאי לזכור לפרקים הבאים:
- בלי `@Injectable()` על class עם תלויות — **אין שגיאה בעלייה**; Nest יוצר אותו בלי ארגומנטים (`design:paramtypes` חסר) והוא קורס בבקשה הראשונה (P20-E20).
- הודעת DI אמיתית ב־Nest 12: `... is available in the OrdersModule module.` + "Potential solutions" (לא "context").
- `ValidationPipe` על `stock` חסר מחזיר **שתי** הודעות (`must not be less than 0` + `must be an integer number`).
- `res.setHeader` לפני `throw` ב־guard — ה־header נשמר בתשובת השגיאה (429 + Retry-After).
- Zod 4: `.transform(...).default(false)` — ה־default הוא ערך פלט. `z.coerce.boolean("false")` ← `true`.
- `APP_FILTER` / `APP_PIPE` / `APP_INTERCEPTOR` בתוך module — כך תרגילים לא צריכים `setup` בבדיקה.

### 7.2 שאר הקורס (לפי האפיון, סעיף 8)

| פרק | נושא | הערות |
|---|---|---|
| 21 | כניסה והרשאות | bcrypt, JWT, refresh tokens, roles, בעלות על מידע, OWASP בסיסי. פרויקט 2 שלב ד׳: משתמשים, כל משתמש רואה רק את שלו |
| 22 | בדיקות | unit, integration, e2e, mocks, מסד בדיקות. כיסוי בדיקות לפרויקט 2 (Jest של Nest או node:test) |
| 23 | Linux ו־Docker | **Docker לא מותקן במחשב** — לסמן דוגמאות כ"לא אומת" או לבקש התקנה. פקודות Linux, Dockerfile, Compose, volumes. פרויקט 2 עולה בפקודה אחת |
| 24 | API של מוצר אמיתי | logs, request ID, תאריכים ואזורי זמן, idempotency, rate limit |
| 25 | CI ופריסה | GitHub Actions, secrets, פריסה חינמית, healthcheck, HTTPS. קישור חי לפרויקט |
| 🏗️ | **פרויקט 3 — הדגל** | מערכת הזמנות: חנות ציוד קפה. דרישות מלאות באפיון, סעיף 10.3: JWT ותפקידים, CRUD למנהל, חיפוש ו־pagination, עגלה←הזמנה עם שמירת מחיר, transaction נגד מלאי שלילי, idempotency key, תשלום מדומה, בדיקות unit+e2e כולל מרוץ, Swagger, `docker compose up`, CI, קישור חי, דף HTML. **נבנה מאפס בלי העתקה מפרויקט 2.** README לפי הדרישות באפיון |
| 26 | Cache ותורים | Redis דרך Docker |
| 27 | אלגוריתמים וראיונות | מרכז את מה שהתחיל מפרק 6 |
| 28 | תכנון מערכת | רשות |
| 29 | AI ב־Backend | רשות. מודלים עדכניים של Claude: `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`. לבדוק בתיעוד לפני כתיבה |
| 30 | תיק עבודות וחיפוש עבודה | אפיון סעיף 11: GitHub, קורות חיים באנגלית, LinkedIn, סימולציות ראיון |

### 7.3 בסוף
- אימות מלא: `node course-src/build.mjs --verify` — הכול ירוק.
- עדכון דף הבית (README.html נבנה אוטומטית מ־chapter.mjs).
- בדיקה ויזואלית של כמה דפים בדפדפן: RTL, איורי SVG (טקסט עברי ב־SVG עם `direction="rtl"`), מצב כהה.
- הודעה ליהודה מה מוכן ואיך להתחיל.

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

- **לא נוצרו סוכנים (agents) ולא סקילים (skills) לפרויקט הזה.** אין `.claude/` בתיקיית הפרויקט, ואין `~/.claude/agents` או `~/.claude/skills`. כל העבודה נעשתה ישירות עם הכלים הרגילים (קבצים, טרמינל, דפדפן מובנה לבדיקות ויזואליות ו־CORS).
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
3. ~~להשלים את פרק 20~~ ✔ הושלם. **עכשיו: פרק 21** (סעיף 7.1–7.2). בענן: קודם `bash course-src/scripts/cloud-setup.sh`.
4. **להמשיך לפרק 21 והלאה**, כל פרק שלם (שיעורים + תרגילים + פתרונות + בדיקות + אימות) לפני הבא.
5. **מדי כמה פרקים** — אימות מלא, ועדכון המסמך הזה (סעיפים 6–7).
