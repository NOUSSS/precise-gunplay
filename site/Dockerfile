# Site vitrine statique, servi par nginx (Coolify : dossier de base /site)
FROM nginx:1.28.0-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css main.js /usr/share/nginx/html/
COPY fonts /usr/share/nginx/html/fonts
COPY img /usr/share/nginx/html/img
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1/healthz || exit 1
