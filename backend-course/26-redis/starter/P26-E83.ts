// P26-E83: outbox relay — מ־PostgreSQL לתור
// כתוב וייצא async relayOutbox(db, queue, limit = 100) → כמה שורות טופלו
//   outbox(id, kind, payload jsonb, sent_at) · שורות בלי sent_at לפי id
//   לכל שורה: queue.add(kind, payload, { jobId: "outbox-" + id }), ואז sent_at = now()
//
// בדיקה:  npm run check P26-E83
