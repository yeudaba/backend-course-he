# P09-E81: מתוקן
git init
echo "# קפה הפינה" > README.md
echo "שעות: 8–20" >> README.md
git add README.md
git commit -m "Add README"
echo "port=3000" > config.txt
echo "password=1234" > secrets.txt
git add config.txt
git commit -m "Add config"
