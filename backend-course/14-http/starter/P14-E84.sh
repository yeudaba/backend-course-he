# P14-E84: שלוש פקודות curl — אף אחת לא שולחת את מה שהתכוונו אליו.
# 1. חיפוש: קטגוריה coffee ומחיר עד 50
# 2. יצירת מוצר: Latte ב־14
# 3. עדכון מחיר של מוצר 7 ל־12
curl http://localhost:4000/products?category=coffee&maxPrice=50
curl -X POST http://localhost:4000/products -d '{"name": "Latte", "price": 14}'
curl -X PATCH http://localhost:4000/products/7 -H 'Content-Type: application/json' -d "{"price": 12}"
