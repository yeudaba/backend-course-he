// P26.5-E83: להחזיר group אחורה (replay)
// כתוב וייצא async rewindGroup(admin, groupId, topic, offsets: { [partition]: offset })
//   alterConsumerGroupOffsets · ערך לא תקין ← RangeError בלי לשנות כלום
//
// בדיקה:  npm run check P26.5-E83
