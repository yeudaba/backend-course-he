// P21-E27: פירוק header של Authorization — חזרה על switch ו־regex
// כתוב וייצא type Credentials = { scheme: "bearer"; token } | { scheme: "basic"; username; password }
//   ו־parseAuthorization(header: string | undefined): Credentials | null
//   בדיוק שתי מילים | scheme בלי תלות באותיות, עם switch | אחר → null
//   bearer: תווים A-Za-z0-9-._~+/ ואחריהם = רק בסוף | basic: base64 של user:password (הנקודתיים הראשונות; שם ריק → null)
//
// הרצה:   node 21-auth/starter/P21-E27.ts
// בדיקה:  npm run check P21-E27
