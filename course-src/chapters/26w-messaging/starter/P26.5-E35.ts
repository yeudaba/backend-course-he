// P26.5-E35: log בזיכרון — partitions, offsets ו־groups
// כתוב וייצא class MemoryLog(partitions): append(key, value) → { partition, offset },
//   read(group, partition, max), commit(group, partition, nextOffset), lag(group)
//   partition = (סכום charCodeAt של ה־key) % partitions
//
// בדיקה:  npm run check P26.5-E35
