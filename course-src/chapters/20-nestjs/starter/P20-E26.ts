// P20-E26: מודול סימניות — מקובץ ריק
// כתוב וייצא BookmarksModule (interface, DTO, service, controller, module). סימניות בזיכרון { id, url, title, tags }, ids מ־1:
//   POST /bookmarks → 201 | DTO: url (@IsUrl), title 1–100 (נשמר אחרי trim), tags? עד 5 מחרוזות (ברירת מחדל [])
//   GET /bookmarks (?tag=x — סינון) | GET /bookmarks/:id → או 404 `סימנייה ${id} לא נמצאה` | id לא מספר → 400
//   DELETE /bookmarks/:id → 204 או 404
//
// בדיקה:  npm run check P20-E26
