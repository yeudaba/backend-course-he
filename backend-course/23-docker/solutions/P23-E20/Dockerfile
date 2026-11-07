# P23-E20 — מתוקן
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.mjs ./
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
