FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
# קודם התלויות — משתנות לעתים רחוקות
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# הקוד — משתנה כל הזמן
COPY src ./src
USER node
EXPOSE 8080
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1
CMD ["node", "src/server.mjs"]
