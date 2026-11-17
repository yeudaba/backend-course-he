// P26.3-E74: helm template קטן
// כתוב וייצא renderTemplate(tpl, { Values, Release, Chart })
//   {{ .Values.a.b }} · {{ X | default Y }} · {{ X | quote }} · חסר ← "" · אובייקט ← Error
//
// בדיקה:  npm run check P26.3-E74
