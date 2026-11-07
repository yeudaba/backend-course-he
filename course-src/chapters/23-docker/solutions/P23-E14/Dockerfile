FROM node:24-alpine
WORKDIR /app
# קודם רק מה שקובע את התלויות — השכבה הזו נשארת ב־cache כל עוד הם לא השתנו
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# הקוד משתנה כל הזמן — הוא אחרון
COPY server.mjs ./
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
