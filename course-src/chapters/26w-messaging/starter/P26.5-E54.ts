// P26.5-E54: worker שנותן הזדמנות שנייה אחת
// כתוב וייצא async startSecondChanceWorker(ch, queue, handler) → consumerTag
//   הצלחה ← ack · כישלון ראשון ← nack עם requeue · redelivered ← nack בלי requeue · JSON פגום ← בלי requeue
//
// בדיקה:  npm run check P26.5-E54
