const fileName = "Invoice-March.PDF";
const dotIndex = fileName.indexOf(".");

const baseName = fileName.slice(0, dotIndex);
const extension = fileName.slice(dotIndex + 1).toLowerCase();

console.log(`שם: ${baseName}`);
console.log(`סיומת: ${extension}`);
console.log(`PDF? ${extension === "pdf"}`);
