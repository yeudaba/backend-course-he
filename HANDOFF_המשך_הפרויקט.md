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
- פרק 21 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות + PR2-AUTH + PR2-AUTH-DB — **ירוק**.
- פרק 22 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות + PR2-TESTS — **ירוק**.
- פרק 23 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות + PR2-DOCKER — **ירוק** (בדיקות Docker אמיתיות: build, run, compose).
- פרק 24 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות + PR2-PROD + PR2-PROD-DB — **ירוק**.
- **פרויקט 3 (הדגל) הושלם**: `25p-project-shop` — 6 שלבים, 6 בודקי "קופסה שחורה" (PR3-AUTH, PR3-PRODUCTS, PR3-ORDERS, PR3-RACE, PR3-PAY, PR3-SHIP) — **ירוק**. נבדק שהבודק של המרוץ נכשל על גרסה נאיבית (12 הזמנות על 3 יחידות).
- פרק 25 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות + PR2-CI + PR2-CI-DB — **ירוק**. ה־workflow של שלב ח׳ רץ באמת ב־GitHub Actions (branch זמני `ci-demo-25`) — הריצה הראשונה נכשלה ב־typecheck (גילוי 13), השנייה ירוקה ב־35 שניות.
- פרק 26 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות + PR3-REDIS (פרויקט 3 שלב 5) — **ירוק**. בודקי PR3 של שלבים 1–4 עוברים גם על פתרון שלב 5 (בלי Redis).
- פרק 27 הושלם: 5 שיעורים, 25 תרגילים, 20 בדיקות (17 TS עם בדיקות ביצועים + 3 SQL) — **ירוק**.
- פרק 28 הושלם (רשות): 5 שיעורים, 25 תרגילים, 20 בדיקות — **ירוק**. כל התרגילים בזיכרון עם שעון/random מוזרקים (בלי מסד או Redis).
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
| 21 | `21-auth` | bcrypt (bcryptjs), JWT (@nestjs/jwt), refresh tokens אטומים (SHA-256 במסד) עם rotation וזיהוי שימוש חוזר, roles, בעלות (404), OWASP API Top 10. שיעור 5 = **פרויקט 2 שלב ד׳**. בדיקות PR2-AUTH (בזיכרון) ו־PR2-AUTH-DB (PostgreSQL אמיתי) | ✔ |
| 22 | `22-testing` | node:test, assert, גבולות, כפילים (mock.fn, mock.timers), זמן ו־TZ, HTTP ו־מסד בדיקות, builders, Jest/supertest ב־Nest, coverage, mutation testing. **רוב התרגילים: הלומד כותב בדיקות, והבודק מריץ אותן על הקוד התקין ועל מוטנטים** (`tools/mutation.mjs`, `files/<id>/mutants.json`). שיעור 5 = **פרויקט 2 שלב ה׳** (PR2-TESTS) | ✔ |
| 23 | `23-docker` | Linux ו־bash (הרשאות, תהליכים, pipelines, סקריפט בטוח), Docker (image/container/volume/port), Dockerfile (cache, .dockerignore, multi-stage, USER, HEALTHCHECK), Compose (רשת, healthcheck+condition, משתנים, override). תרגילי shell נבדקים על fixtures (`tools/shell.mjs`); תרגילי Docker — build/run/compose אמיתיים (`tools/docker.mjs`). שיעור 5 = **פרויקט 2 שלב ו׳** (PR2-DOCKER) | ✔ |
| 24 | `24-production` | לוגים מובנים (JSON, רמות, redact), X-Request-Id ו־AsyncLocalStorage, זמן (רגע מול תאריך מקומי, Intl, שעון קיץ — 27.3.2026/25.10.2026 בישראל, 8.3.2026 בקובה: חצות לא קיים), Idempotency-Key (כולל מרוץ ב־PostgreSQL עם ON CONFLICT — E16 מול המסד), rate limiting (fixed/sliding/token bucket, Retry-After, trust proxy), graceful shutdown. כל התרגילים TS/Express רגילים (`load`), בלי Nest. שיעור 5 = **פרויקט 2 שלב ז׳** (PR2-PROD, PR2-PROD-DB) | ✔ |
| 25 | `25-deploy` | CI ב־GitHub Actions (workflow, services, cache, matrix, needs/if), הגדרות וסודות (Secrets/Variables, להיכשל מהר, TLS למסד בענן), פריסה (Render + Neon, deploy hook, migrations ב־CI, expand/contract, smoke, rollback, blue/green), HTTPS ו־reverse proxy (ניסוי Caddy אמיתי, trust proxy, security headers, health/ready). תרגילי workflow = קובצי `.yml` שנבדקים עם js-yaml (`tests/_workflow.mjs`). שיעור 5 = **פרויקט 2 שלב ח׳** (PR2-CI, PR2-CI-DB) | ✔ |

| 26 | `26-redis` | Redis (מבני נתונים, TTL, MULTI, keyPrefix), cache-aside (מדידה אמיתית: MISS 68–93ms מול HIT ~2.5ms על 20,000 מוצרים), ביטול בגרסה (INCR), stampede/single-flight, הגבלת קצב משותפת (INCR+EXPIRE NX, sorted set, Lua token bucket), מנעול (SET NX PX + token + Lua release), pub/sub, BullMQ (attempts/backoff/delay/jobId, at-least-once, צרכן idempotent, outbox). תרגילים מול Redis אמיתי (`tools/redis.mjs`). שיעור 5 = **פרויקט 3 שלב 5** (PR3-REDIS) | ✔ |
| 27 | `27-algorithms` | סיבוכיות (מדידה אמיתית: includes מול Set — 10K: 1,021ms מול 1.7ms, 80K: 61 שניות מול 16ms), Map/Set (4 דפוסים), שני מצביעים, LRU, מחסנית/תור, רקורסיה, חיפוש בינארי, BFS/DFS, מיון טופולוגי, DP, Trie; שיטת ראיון (6 צעדים + משפטים באנגלית), SQL (second highest, top-N לכל קבוצה עם RANK/ROW_NUMBER, NOT EXISTS מול LEFT JOIN), בנק 20 שאלות Backend ו"באג שפתרתי". טבלת "אחרי איזה פרק" לתרגול 2–3 בשבוע (לפי האפיון). `tests/_perf.mjs`: `fastEnough`, `countingArray` (Proxy שסופר קריאות — בדיקה שחיפוש בינארי לוגריתמי), `seeded`. נתוני SQL: `files/interview.sql` | ✔ |
| 28 | `28-system-design` | שיטה (7 שלבים, אומדנים), אבני בניין (stateless, LB, replicas + read-after-write, cache/תור/CDN), כשלים (timeout, retry+jitter, circuit breaker), קיצור קישורים מקצה לקצה, נתונים בקנה מידה (OFFSET מול cursor — מדידה: 83ms מול 0.057ms על מיליון שורות; consistent hashing — מדידה: 4←5 modulo 80.3% מול טבעת 19.2%; Snowflake/UUIDv7; batching; Bloom filter — 1.2MB, 1.002% FP), פיד היברידי, ומסמך תכנון לחנות הקפה ×100 | ✔ |

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
   - פרויקטים הם CommonJS, מקומפלים עם tsc (`experimentalDecorators`, `emitDecoratorMetadata`).
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

---

## 7. מה נשאר לעשות

### 7.1 הצעד הבא המיידי — פרק 29 (AI ב־Backend)
לפי האפיון: רשות. לבדוק בתיעוד העדכני של Anthropic לפני כתיבה (מודלים: `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`; SDK `@anthropic-ai/sdk`). רעיונות: קריאה ל־API משרת Nest (מפתח בסביבה, לא בקוד), streaming, tool use, פלט JSON עם ולידציה ב־Zod, עלויות ו־rate limits, cache לתשובות, הגנה מ־prompt injection, ובדיקות עם client מדומה. בבודקים — אין רשת: fake client. בסביבת הענן אין מפתח API — דוגמאות run לא קוראות ל־API אמיתי (או לבקש מפתח דרך request_credential אם רוצים פלט אמיתי).
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

| פרק | נושא | הערות |
|---|---|---|
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
3. ~~פרקים 20–28 ופרויקט 3 (כולל שלב 5)~~ ✔ הושלמו. **עכשיו: פרק 29** (סעיף 7.1–7.2). בענן: קודם `bash course-src/scripts/cloud-setup.sh` (אחרי הפסקה ארוכה הקונטיינר נעצר — הסקריפט מעלה אותו מחדש), ואז `export PATH=/opt/node24/bin:$PATH`.
4. **להמשיך לפרק 26 והלאה**, כל פרק שלם (שיעורים + תרגילים + פתרונות + בדיקות + אימות) לפני הבא.
5. **מדי כמה פרקים** — אימות מלא, ועדכון המסמך הזה (סעיפים 6–7).
