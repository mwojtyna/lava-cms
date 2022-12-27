FROM nginx:1.23.3-alpine-slim

COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
