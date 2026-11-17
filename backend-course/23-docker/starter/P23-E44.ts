// P23-E44: parseImageRef
// כתוב וייצא type ImageRef = { registry, repository, tag, digest } ו־parseImageRef(ref)
//   postgres:18-alpine ← docker.io, library/postgres, 18-alpine, null | בלי tag ← latest | @sha256:... ← digest
//   לא תקין ← Error(`שם לא תקין: ${ref}`)
//
// הרצה:   node 23-docker/starter/P23-E44.ts
// בדיקה:  npm run check P23-E44
