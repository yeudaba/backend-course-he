// P01-E23: קוד "ישן". עדכן אותו לסגנון מודרני: בלי var, const כשאפשר, let רק כשצריך.
var storeName = "הספרייה של דני";
var booksSold = 0;
var bookPrice = 40;
var Total_Income = 0;

booksSold = booksSold + 3;
Total_Income = Total_Income + bookPrice + bookPrice + bookPrice;

console.log(storeName);
console.log("נמכרו:", booksSold, "הכנסות:", Total_Income);
