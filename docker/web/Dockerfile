# Stage 1: Build Vite app
FROM node:20-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

# Build args passed from docker-compose (or --build-arg)
ARG VITE_API_URL=http://localhost:8000/api
ARG VITE_MIDTRANS_CLIENT_KEY=Mid-client-TvoAzMIy6duIywlA

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MIDTRANS_CLIENT_KEY=$VITE_MIDTRANS_CLIENT_KEY

# Copy monorepo workspace config
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/

# Install only web workspace deps
RUN pnpm install --filter web...

# Copy web source
COPY apps/web/ ./apps/web/

# Build
RUN pnpm --filter web build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
