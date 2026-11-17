git init
printf "port=3000\nhost=localhost\nmode=dev\nlog=info\ncache=off\n" > config.txt
git add config.txt
git commit -m "Add config"

git switch -c feature/prod
printf "port=80\nhost=localhost\nmode=dev\nlog=info\ncache=off\n" > config.txt
git commit -am "Use prod mode"

git switch main
printf "port=3000\nhost=localhost\nmode=dev\nlog=info\ncache=on\n" > config.txt
git commit -am "Enable cache"

git merge --no-edit feature/prod
