# P14-E84: שלוש פקודות curl — מתוקנות
curl 'http://localhost:4000/products?category=coffee&maxPrice=50'
curl -X POST http://localhost:4000/products -H 'Content-Type: application/json' -d '{"name": "Latte", "price": 14}'
curl -X PATCH http://localhost:4000/products/7 -H 'Content-Type: application/json' -d '{"price": 12}'
