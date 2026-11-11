# P09-E75: שני מחשבים — clone ו־pull
# server.git (bare) → clone ל־laptop: "Add README" (README.md: # Notes) + push -u
# → clone ל־desktop: "Add todo" (todo.txt: buy milk) + push → ב־laptop: git pull.
# בסוף: אותם שני commits ב־server.git, laptop ו־desktop.
#
# לנסות בעצמך (מתוך ~/dev/backend-course):
#   mkdir -p playground/e75 && cd playground/e75 && bash ../../09-git/starter/P09-E75.sh && git -C laptop log --oneline
#   (לפני ניסיון נוסף: cd ../.. ומחק את playground/e75)
# בדיקה (מתוך ~/dev/backend-course):  npm run check P09-E75
