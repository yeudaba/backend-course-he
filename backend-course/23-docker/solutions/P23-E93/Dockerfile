FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY web/ /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK --interval=5s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ || exit 1
