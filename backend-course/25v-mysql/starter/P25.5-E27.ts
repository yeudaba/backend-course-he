// P25.5-E27: INSERT מרובה שורות עם upsert — חזרה על Object.keys, map/flatMap/join, regex ו־injection
// כתוב וייצא buildBulkInsert(table, rows, { add?, set? } = {}) → { sql, params }
//   INSERT INTO `t` (`a`, `b`) VALUES (?, ?), (?, ?) — העמודות לפי השורה הראשונה, params לפי אותו סדר
//   add: ["quantity"] → ... AS new ON DUPLICATE KEY UPDATE `quantity` = `t`.`quantity` + new.`quantity`
//   set: ["name"]     → `name` = new.`name`        (קודם add, אחר כך set, מופרדים בפסיק)
//   אין שורות / עמודות שונות בין השורות / שם שלא מתאים ל־^[a-z_][a-z0-9_]*$ ← Error
//
// הרצה:   node 25v-mysql/starter/P25.5-E27.ts
// בדיקה:  npm run check P25.5-E27
