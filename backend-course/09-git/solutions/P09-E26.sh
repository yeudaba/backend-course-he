# P09-E26: מאגר ראשון — כסקריפט
git init

echo "# Notes" > README.md
git add README.md
git commit -m "Add README"

echo "first note" > notes.txt
echo "*.log" > .gitignore
echo "debug" > app.log
git add .
git commit -m "Add notes"

echo "second note" >> notes.txt
git commit -am "Add second note"
