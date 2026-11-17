const fileName = "Report.PDF";
const ext = fileName.slice(fileName.indexOf(".") + 1).toLowerCase();
let kind;
switch (ext) {
  case "pdf":
    kind = "מסמך PDF";
    break;
  case "jpg":
  case "jpeg":
  case "png":
    kind = "תמונה";
    break;
  case "mp4":
    kind = "וידאו";
    break;
  default:
    kind = "סוג לא מוכר";
}
console.log(`${fileName}: ${kind}`);
