git init
echo 'console.log("app")' > app.js
git add app.js
git commit -m "Add app"

git switch -c feature/a
echo "A" > a.txt
git add a.txt
git commit -m "Add a"

git switch main
echo "B" > b.txt
git add b.txt
git commit -m "Add b"

git merge --no-edit feature/a
