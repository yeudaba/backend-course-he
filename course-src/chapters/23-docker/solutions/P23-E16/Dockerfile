FROM node:24-alpine
WORKDIR /app
COPY package.json server.mjs ./
ENV PORT=8080
EXPOSE 8080
USER node
# צורת shell (לא מערך) — כדי ש־$PORT יתורגם. wget קיים ב־alpine
HEALTHCHECK --interval=2s --timeout=2s --start-period=3s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:$PORT/health" || exit 1
CMD ["node", "server.mjs"]
