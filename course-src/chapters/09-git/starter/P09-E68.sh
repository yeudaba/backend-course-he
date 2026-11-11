# P09-E68: מיזוג של שורות שונות באותו קובץ
# "Add config" — config.txt עם 5 שורות: port=3000, host=localhost, mode=dev, log=info, cache=off
# feature/prod: "Use prod mode" — רק השורה הראשונה → port=80
# main: "Enable cache" — רק השורה האחרונה → cache=on
# git merge --no-edit feature/prod (בלי התנגשות) — בסוף שני השינויים בקובץ.
#
# לנסות בעצמך (מתוך ~/dev/backend-course):
#   mkdir -p playground/e68 && cd playground/e68 && bash ../../09-git/starter/P09-E68.sh && cat config.txt && git log --oneline --graph
#   (לפני ניסיון נוסף: cd ../.. ומחק את playground/e68)
# בדיקה (מתוך ~/dev/backend-course):  npm run check P09-E68
