# ---------- שלב 1: build — כל התלויות, קומפילציה ----------
FROM node:24-alpine AS build
WORKDIR /app

# קודם רק package*.json: כל עוד הם לא השתנו, Docker משתמש ב־npm ci מה־cache
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

# ---------- שלב 2: runtime — רק מה שצריך כדי לרוץ ----------
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --omit=optional && npm cache clean --force
COPY --from=build /app/dist ./dist

# לא root: אם מישהו פורץ לאפליקציה, הוא לא root בתוך הקונטיינר
USER node
EXPOSE 3000
# PORT: פלטפורמות קובעות port משלהן (Render: 10000). בלי — 3000
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3000}/health || exit 1
CMD ["node", "dist/main.js"]
