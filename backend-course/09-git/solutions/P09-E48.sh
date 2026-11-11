git init
echo 'require("./utils")' > app.js
echo "module.exports = {};" > utils.js
git add app.js
git commit -m "Add app"

git add utils.js
git commit --amend --no-edit
