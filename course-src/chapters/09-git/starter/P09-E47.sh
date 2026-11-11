# P09-E47: revert ל־commit עם באג
# 3 commits: "Add VAT" (vat.txt: 0.17), "Change VAT to 0.71" (vat.txt: 0.71), "Add README" (README.md: # Shop).
# ואז git revert --no-edit HEAD~1. בסוף 4 commits, vat.txt = 0.17, README.md קיים.
#
# לנסות בעצמך (מתוך ~/dev/backend-course):
#   mkdir -p playground/e47 && cd playground/e47 && bash ../../09-git/starter/P09-E47.sh && git log --oneline
#   (לפני ניסיון נוסף: cd ../.. ומחק את playground/e47)
# בדיקה (מתוך ~/dev/backend-course):  npm run check P09-E47
