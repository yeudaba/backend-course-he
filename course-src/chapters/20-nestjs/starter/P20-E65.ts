// P20-E65: אסטרטגיית תמחור לפי הגדרה
// כתוב וייצא CONFIG, PRICING (tokens), interface Pricing { name, price(base) }, RegularPricing, HolidayPricing (15%),
//   PriceController (GET /price/:base ← { base, final, strategy }; לא חיובי / לא מספר ← 400), PricingModule
//   PRICING עם useFactory + inject: [CONFIG]
//
// בדיקה:  npm run check P20-E65
