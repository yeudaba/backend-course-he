const role = "viewer";
const isAuthor = true;
const isLocked = false;
const isPublished = true;

const canEdit =
  role === "admin" ||
  (role === "editor" && !isLocked) ||
  (isAuthor && !isLocked && !isPublished);

console.log(`רשאי לערוך? ${canEdit}`);
