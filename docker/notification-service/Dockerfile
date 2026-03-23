# Stage 1: Build TypeScript
FROM node:20-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

# Copy package files
COPY apps/notification-service/package.json apps/notification-service/pnpm-lock.yaml* ./

# Install all deps (including dev for build)
RUN pnpm install

# Copy source
COPY apps/notification-service/src ./src
COPY apps/notification-service/tsconfig.json ./

# Compile TypeScript
RUN pnpm build

# Stage 2: Production image
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

# Copy package files and install production deps only
COPY apps/notification-service/package.json apps/notification-service/pnpm-lock.yaml* ./
RUN pnpm install --prod

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

# Baileys persistent auth storage
VOLUME ["/app/auth_info_baileys"]

EXPOSE 3001
CMD ["node", "dist/server.js"]
