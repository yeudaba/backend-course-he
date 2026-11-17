# P09-E48: שכחתי קובץ ב־commit
# app.js (require("./utils")) + utils.js (module.exports = {};).
# commit "Add app" רק עם app.js, ואז תיקון עם git commit --amend --no-edit — בסוף commit אחד עם שני הקבצים.
#
# לנסות בעצמך (מתוך ~/dev/backend-course):
#   mkdir -p playground/e48 && cd playground/e48 && bash ../../09-git/starter/P09-E48.sh && git log --oneline
#   (לפני ניסיון נוסף: cd ../.. ומחק את playground/e48)
# בדיקה (מתוך ~/dev/backend-course):  npm run check P09-E48
