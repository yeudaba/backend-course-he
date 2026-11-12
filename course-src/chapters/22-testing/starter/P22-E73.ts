// P22-E73: createTestApp ל־Nest
// כתוב וייצא createTestApp(rootModule, overrides = [], configure?) ← { app, http, close }
//   Test.createTestingModule + overrideProvider(token).useValue(value) | createNestApplication, configure?.(app), init()
//   http() ← request(app.getHttpServer()) (supertest) | close() ← app.close()
//
// בדיקה:  npm run check P22-E73
