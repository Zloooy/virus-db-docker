FROM nginx:1.18.0-alpine
COPY nginx.conf /etc/nginx/nginx.conf
WORKDIR /usr/share/nginx/html
COPY static/ .
EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]
