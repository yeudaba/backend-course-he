# P09-E80: זרימת PR מקצה לקצה
# server.git (bare) + clone ל־app: "Add README" (README.md: # App) + push -u origin main
# ענף feature/usage: שורה "Run: node index.js" בסוף README.md, commit "Add usage to README", push -u origin feature/usage
# main: git merge --no-ff --no-edit feature/usage, push, ומחיקת הענף המקומי.
#
# לנסות בעצמך (מתוך ~/dev/backend-course):
#   mkdir -p playground/e80 && cd playground/e80 && bash ../../09-git/starter/P09-E80.sh && git -C server.git log --oneline --graph --all
#   (לפני ניסיון נוסף: cd ../.. ומחק את playground/e80)
# בדיקה (מתוך ~/dev/backend-course):  npm run check P09-E80
