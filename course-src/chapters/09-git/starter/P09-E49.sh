# P09-E49: להוציא מהמעקב בלי למחוק
# commit 1 "Initial commit": app.js, debug.log, .env — כולם (הטעות).
# commit 2 "Stop tracking log and env": .gitignore (*.log, .env) + הוצאת debug.log ו־.env מהמעקב בלי למחוק מהדיסק.
# בסוף: ב־HEAD רק .gitignore ו־app.js; הקבצים עדיין בתיקייה; status נקי.
#
# לנסות בעצמך (מתוך ~/dev/backend-course):
#   mkdir -p playground/e49 && cd playground/e49 && bash ../../09-git/starter/P09-E49.sh && git log --oneline && ls -a
#   (לפני ניסיון נוסף: cd ../.. ומחק את playground/e49)
# בדיקה (מתוך ~/dev/backend-course):  npm run check P09-E49
