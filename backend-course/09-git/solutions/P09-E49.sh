git init
echo "console.log(1)" > app.js
echo "trace" > debug.log
echo "API_KEY=123" > .env
git add .
git commit -m "Initial commit"

printf "*.log\n.env\n" > .gitignore
git rm --cached debug.log .env
git add .gitignore
git commit -m "Stop tracking log and env"
