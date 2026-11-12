// P26.3-E34: AZ, region ופיזור עותקים
// כתוב וייצא:
//   regionOf(az) → "eu-central-1a" ← "eu-central-1" · לא תקין ← null
//   spreadAcrossAzs(replicas, azs) → { az: עותקים } בסבב · בלי AZs ← RangeError
//   survivesAzLoss(spread, minHealthy) → true אם כל AZ אחד שנופל משאיר לפחות minHealthy
//
// בדיקה:  npm run check P26.3-E34
