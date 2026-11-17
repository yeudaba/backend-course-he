// P26-E79: תור פשוט מ־list
// כתוב וייצא:
//   enqueue(redis, queue, job) → האורך החדש (JSON לסוף q:<queue>)
//   drain(redis, queue, handler) → { done, failed } · מהראש עד שריק · כישלון ← { job, error } ל־q:<queue>:failed
//
// בדיקה:  npm run check P26-E79
