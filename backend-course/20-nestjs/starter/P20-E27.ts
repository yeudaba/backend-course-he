// P20-E27: slug: regex בפונקציה וב־pipe — חזרה על regex ו־implements
// כתוב וייצא slugify(title): אותיות קטנות, כל רצף שאינו a-z0-9 → מקף אחד, בלי מקפים בקצוות
//   class SlugPipe implements PipeTransform — slug תקין (מילים a-z0-9 עם מקף אחד ביניהן, עד 60 תווים)
//      אחרת BadRequestException(`slug לא תקין: ${value}`)
//   SlugsController ("slugs"): GET preview?title=... → { slug: slugify(title) } | GET :slug (עם SlugPipe) → { slug }
//   SlugsModule
//
// בדיקה:  npm run check P20-E27
