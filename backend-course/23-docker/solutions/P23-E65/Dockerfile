# ---------- build: תלויות מלאות, בדיקות, קומפילציה ----------
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# בדיקות שנכשלות ← ה־build נעצר, ואין image
RUN npm test
RUN npm run build
# ---------- runtime ----------
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/main.js"]
