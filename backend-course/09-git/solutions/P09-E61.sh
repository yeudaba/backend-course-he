git init
echo "Hello" > greeting.txt
git add greeting.txt
git commit -m "Add greeting"

git switch -c feature/hebrew
echo "שלום" > greeting.txt
git commit -am "Translate greeting"

git switch main
echo "Hello!" > greeting.txt
git commit -am "Make greeting louder"

git merge feature/hebrew
echo "Hello! / שלום" > greeting.txt
git add greeting.txt
git commit --no-edit
