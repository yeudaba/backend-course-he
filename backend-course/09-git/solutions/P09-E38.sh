git init

echo '{"name":"demo"}' > package.json
git add package.json
git commit -m "Add package.json"

echo '{"name":"demo","scripts":{"start":"node index.js"}}' > package.json
git add package.json
git commit -m "Add start script"

echo 'console.log("hi")' > index.js
git add index.js
git commit -m "Add index.js"

echo "temporary notes" > scratch.txt
