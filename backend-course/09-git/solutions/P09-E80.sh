git init --bare server.git
git clone server.git app
cd app
echo "# App" > README.md
git add README.md
git commit -m "Add README"
git push -u origin main

git switch -c feature/usage
echo "Run: node index.js" >> README.md
git commit -am "Add usage to README"
git push -u origin feature/usage

git switch main
git merge --no-ff --no-edit feature/usage
git push
git branch -d feature/usage
