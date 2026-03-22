FROM nginx:stable-alpine

# Copy the pre-built dist folder from the host (since source is missing)
COPY ./apps/web/dist /usr/share/nginx/html
COPY ./docker/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
