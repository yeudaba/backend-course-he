git init --bare server.git
mkdir project
cd project
git init
echo "# Shop" > README.md
git add README.md
git commit -m "Add README"
git remote add origin ../server.git
git push -u origin main
