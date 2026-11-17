# P09-E61: התנגשות — בסקריפט
# "Add greeting" (greeting.txt: Hello) → ענף feature/hebrew: "Translate greeting" (שלום)
# → ב־main: "Make greeting louder" (Hello!) → git merge feature/hebrew (התנגשות)
# → פתרון: greeting.txt = "Hello! / שלום" → git add + git commit --no-edit
#
# לנסות בעצמך (מתוך ~/dev/backend-course):
#   mkdir -p playground/e61 && cd playground/e61 && bash ../../09-git/starter/P09-E61.sh && cat greeting.txt && git log --oneline --graph
#   (לפני ניסיון נוסף: cd ../.. ומחק את playground/e61)
# בדיקה (מתוך ~/dev/backend-course):  npm run check P09-E61
