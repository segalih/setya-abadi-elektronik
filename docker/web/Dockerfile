FROM node:20-alpine as build

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files (monorepo root and workspace packages)
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --filter web...

# Copy source
COPY . .

# Build
RUN pnpm run build --filter web

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY ./docker/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
