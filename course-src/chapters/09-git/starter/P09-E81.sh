# P09-E81: המאגר יצא לא כמו שתכננו — שלוש תקלות.
# commit 1 "Add README": רק README.md, שתי שורות ("# קפה הפינה", "שעות: 8–20")
# commit 2 "Add config": רק config.txt (port=3000)
# secrets.txt נשאר בתיקייה, ולא נכנס לאף commit
#
# לנסות בעצמך (מתוך ~/dev/backend-course):
#   mkdir -p playground/e81 && cd playground/e81 && bash ../../09-git/starter/P09-E81.sh && git log --stat
#   (לפני ניסיון נוסף: cd ../.. ומחק את playground/e81)
# בדיקה (מתוך ~/dev/backend-course):  npm run check P09-E81
git init
echo "# קפה הפינה" > README.md
git add README.md
echo "שעות: 8–20" >> README.md
git commit -m "Add README"
echo "port=3000" > config.txt
echo "password=1234" > secrets.txt
git add .
git commit "Add config"
