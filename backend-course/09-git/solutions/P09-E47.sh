git init
echo "0.17" > vat.txt
git add vat.txt
git commit -m "Add VAT"

echo "0.71" > vat.txt
git commit -am "Change VAT to 0.71"

echo "# Shop" > README.md
git add README.md
git commit -m "Add README"

git revert --no-edit HEAD~1
