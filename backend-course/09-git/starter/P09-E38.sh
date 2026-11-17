# P09-E38: מאגר לפי מפרט
# 3 commits (מהישן): "Add package.json", "Add start script", "Add index.js".
# package.json: {"name":"demo"} → ב־commit 2: {"name":"demo","scripts":{"start":"node index.js"}}
# index.js (commit 3): console.log("hi")
# scratch.txt קיים ו־untracked — git status --short מראה רק: ?? scratch.txt
#
# לנסות בעצמך (מתוך ~/dev/backend-course):
#   mkdir -p playground/e38 && cd playground/e38 && bash ../../09-git/starter/P09-E38.sh && git log --oneline && git status --short
#   (לפני ניסיון נוסף: cd ../.. ומחק את playground/e38)
# בדיקה (מתוך ~/dev/backend-course):  npm run check P09-E38
