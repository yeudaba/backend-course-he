# P23-E65: כתוב כאן Dockerfile בשני שלבים (המפרט בדף התרגילים)
# build: npm ci ← COPY . . ← RUN npm test ← RUN npm run build
# runtime: npm ci --omit=dev · COPY --from=build /app/dist ./dist · USER node · CMD ["node", "dist/main.js"]
# בדיקה: npm run check P23-E65
