const title = "הנסיך הקטן";
const pages = 96;
let isAvailable = true;
let borrower = null; // אף אחד לא שאל — ריק בכוונה
let dueDate; // ייקבע רק כשמישהו ישאל

console.log("ספר:", title, "| עמודים:", pages, "| סוג:", typeof pages);
console.log("זמין:", isAvailable, "| שואל:", borrower, "| תאריך החזרה:", dueDate);

console.log("--- הספר הושאל ---");
isAvailable = false;
borrower = "דני";
dueDate = "2026-12-01";
console.log("זמין:", isAvailable, "| שואל:", borrower, "| תאריך החזרה:", dueDate);
