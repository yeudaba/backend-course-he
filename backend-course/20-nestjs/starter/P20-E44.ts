// P20-E44: service אסינכרוני — 404 ו־500
// כתוב וייצא UsersService (async findOne: 20ms, 404 `משתמש ${id} לא נמצא`, id 13 ← Error("db timeout")),
//   UsersController (GET /users/:id, GET /users?ids=1,2,9 — במקביל, בלי החסרים), UsersModule
//
// בדיקה:  npm run check P20-E44
