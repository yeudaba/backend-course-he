# P23-E20: שלוש תקלות. הוא נבנה ורץ — אבל לא ככה כותבים Dockerfile
FROM node:24-alpine
WORKDIR /app
COPY . .
RUN npm ci --omit=dev
ENV JWT_SECRET=dev-secret-do-not-use-in-production
EXPOSE 3000
CMD ["node", "server.mjs"]
