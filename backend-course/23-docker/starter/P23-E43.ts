// P23-E43: parsePorts
// כתוב וייצא type PortMap = { hostIp, hostPort, containerPort, protocol } ו־parsePorts(text): PortMap[]
//   "0.0.0.0:55432->5432/tcp, [::]:55432->5432/tcp" | בלי -> מדלגים | ריק ← [] | אחר ← Error(`לא מובן: ${item}`)
//
// הרצה:   node 23-docker/starter/P23-E43.ts
// בדיקה:  npm run check P23-E43
