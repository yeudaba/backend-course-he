// נתוני הדוגמה של יחידה 25.7: חנות הקפה, הפעם כמסמכים.
// הבודקים טוענים אותם לכל database זמני. לטעון אצלך: node 25w-mongodb/files/load-seed.mjs
// (מזהים קריאים — "p1", "c1", "o1" — כדי שיהיה קל לעקוב. בפרויקט אמיתי _id הוא בדרך כלל ObjectId)

const d = (s) => new Date(s);

export const products = [
  { _id: "p1", name: "Ethiopia Yirgacheffe", category: "beans", price: 62, stock: 40, tags: ["light", "single-origin"], specs: { origin: "Ethiopia", roast: "light" }, reviews: [{ by: "c1", rating: 5 }, { by: "c3", rating: 4 }], ratingCount: 2, ratingSum: 9 },
  { _id: "p2", name: "Colombia Huila", category: "beans", price: 55, stock: 0, tags: ["medium", "single-origin"], specs: { origin: "Colombia", roast: "medium" }, reviews: [{ by: "c2", rating: 3 }], ratingCount: 1, ratingSum: 3 },
  { _id: "p3", name: "House Espresso Blend", category: "beans", price: 48, stock: 120, tags: ["dark", "blend"], specs: { origin: "Brazil/India", roast: "dark" }, reviews: [{ by: "c1", rating: 4 }, { by: "c2", rating: 5 }, { by: "c3", rating: 5 }], ratingCount: 3, ratingSum: 14 },
  { _id: "p4", name: "Decaf Brazil", category: "beans", price: 50, stock: 15, tags: ["medium", "decaf"], specs: { origin: "Brazil", roast: "medium" }, reviews: [], ratingCount: 0, ratingSum: 0 },
  { _id: "p5", name: "V60 Dripper", category: "gear", price: 89, stock: 12, tags: ["pour-over"], specs: { material: "ceramic" }, reviews: [{ by: "c3", rating: 5 }], ratingCount: 1, ratingSum: 5 },
  { _id: "p6", name: "Hand Grinder", category: "gear", price: 249, stock: 5, tags: ["grinder"], specs: { material: "steel" }, reviews: [{ by: "c1", rating: 2 }], ratingCount: 1, ratingSum: 2 },
  { _id: "p7", name: "Gooseneck Kettle", category: "gear", price: 199, stock: 0, tags: ["pour-over", "kettle"], specs: { material: "steel" }, reviews: [], ratingCount: 0, ratingSum: 0 },
  { _id: "p8", name: "Ceramic Mug", category: "merch", price: 35, stock: 60, tags: ["mug"], specs: { material: "ceramic" }, reviews: [{ by: "c2", rating: 4 }], ratingCount: 1, ratingSum: 4 },
];

export const customers = [
  { _id: "c1", name: "Dana Levi", email: "dana@example.com", city: "Haifa", createdAt: d("2026-09-01T08:00:00Z") },
  { _id: "c2", name: "Yossi Cohen", email: "yossi@example.com", city: "Tel Aviv", createdAt: d("2026-09-03T12:30:00Z") },
  { _id: "c3", name: "Maya Katz", email: "maya@example.com", city: "Haifa", createdAt: d("2026-09-10T17:45:00Z") },
  { _id: "c4", name: "Avi Mizrahi", email: "avi@example.com", city: "Jerusalem", createdAt: d("2026-10-20T09:15:00Z") },
];

// בכל הזמנה — עותק של השם והמחיר בזמן הקנייה (המחיר במוצר יכול להשתנות אחר כך)
const item = (productId, qty) => {
  const p = products.find((x) => x._id === productId);
  return { productId, name: p.name, price: p.price, qty };
};
const order = (_id, customerId, status, createdAt, items) => ({
  _id, customerId, status, createdAt: d(createdAt), items, total: items.reduce((s, i) => s + i.price * i.qty, 0),
});

export const orders = [
  order("o1", "c1", "delivered", "2026-10-02T09:12:00Z", [item("p1", 2), item("p5", 1)]),
  order("o2", "c2", "delivered", "2026-10-05T14:40:00Z", [item("p3", 3)]),
  order("o3", "c1", "paid", "2026-10-11T07:05:00Z", [item("p6", 1)]),
  order("o4", "c3", "delivered", "2026-10-14T19:20:00Z", [item("p1", 1), item("p8", 2)]),
  order("o5", "c2", "cancelled", "2026-10-18T10:00:00Z", [item("p7", 1)]),
  order("o6", "c3", "paid", "2026-10-21T21:55:00Z", [item("p3", 2), item("p4", 1)]),
  order("o7", "c1", "pending", "2026-10-25T11:30:00Z", [item("p8", 4)]),
  order("o8", "c2", "delivered", "2026-10-28T08:45:00Z", [item("p1", 1), item("p3", 1)]),
  order("o9", "c3", "pending", "2026-11-01T22:10:00Z", [item("p5", 1), item("p2", 1)]),
  order("o10", "c1", "delivered", "2026-11-03T13:00:00Z", [item("p4", 2)]),
];

export async function seedShop(db) {
  // עותקים — כדי שבדיקה אחת שמשנה מסמך לא תשנה את הנתונים של הבאה
  const copy = (x) => structuredClone(x);
  await db.collection("products").insertMany(products.map(copy));
  await db.collection("customers").insertMany(customers.map(copy));
  await db.collection("orders").insertMany(orders.map(copy));
}
