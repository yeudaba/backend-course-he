// P07-E44: פירוק "key=value"
// parseSettings(text): "name=Dana; age=31" → { name: "Dana", age: "31" }
// זוגות מופרדים ב־; — trim לשם ולערך. זוג ריק / בלי = / שם ריק → מדלגים. הערך יכול להכיל = (חותכים ב־= הראשון).
// בסוף הקובץ: module.exports = { parseSettings };
//
// הרצה:   node 07-objects/starter/P07-E44.js
// בדיקה:  npm run check P07-E44
