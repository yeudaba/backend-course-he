# P09-E26: מאגר ראשון — כסקריפט
# כתוב כאן את פקודות ה־Git, אחת בכל שורה, בדיוק כמו שהיית מקליד ב־Terminal.
# הסקריפט רץ בתיקייה ריקה, ובסופו צריכים להיות במאגר שלושה commits:
#   1. "Add README"       — README.md עם השורה: # Notes
#   2. "Add notes"        — notes.txt עם השורה first note, ו־.gitignore עם השורה *.log
#                           (לפני ה־commit צור גם app.log עם השורה debug — והוא לא נכנס למאגר)
#   3. "Add second note"  — השורה second note נוספת לסוף notes.txt
#
# לנסות בעצמך (מתוך ~/dev/backend-course):
#   mkdir -p playground/e26 && cd playground/e26 && bash ../../09-git/starter/P09-E26.sh && git log --oneline
#   (לפני ניסיון נוסף: cd ../.. ומחק את playground/e26)
# בדיקה (מתוך ~/dev/backend-course):  npm run check P09-E26
