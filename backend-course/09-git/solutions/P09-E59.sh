git init
echo "# App" > README.md
git add README.md
git commit -m "Add README"

git switch -c feature/about
echo "# About" > about.md
git add about.md
git commit -m "Add about page"

git switch main
git merge feature/about
git branch -d feature/about
