// P22-E56: createTestDatabase
// כתוב וייצא createTestDatabase(url, migrations: string[]) ← { schema, client, reset(tables), close() }
//   אין url ← Error("חסר DATABASE_URL_TEST") | schema test_<8 hex>, SET search_path, migrations לפי הסדר
//   reset ← TRUNCATE ... RESTART IDENTITY CASCADE | close ← DROP SCHEMA ... CASCADE + סגירת החיבור
//
// הרצה:   node 22-testing/starter/P22-E56.ts
// בדיקה:  npm run check P22-E56
