// P15.5-E11: שלוש תקלות — XSS, "undefined:", ו־postComment שלא מזהה שגיאה
export function renderComments(comments) {
  let html = "<ul>";
  for (const c of comments) {
    html += "<li><b>" + c.author + "</b>: " + c.text + "</li>";
  }
  return html + "</ul>";
}

export async function postComment(baseUrl, text) {
  const res = await fetch(baseUrl + "/comments", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return res.json();
}
