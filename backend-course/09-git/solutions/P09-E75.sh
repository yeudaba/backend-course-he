git init --bare server.git

git clone server.git laptop
cd laptop
echo "# Notes" > README.md
git add README.md
git commit -m "Add README"
git push -u origin main
cd ..

git clone server.git desktop
cd desktop
echo "buy milk" > todo.txt
git add todo.txt
git commit -m "Add todo"
git push
cd ..

cd laptop
git pull
cd ..
