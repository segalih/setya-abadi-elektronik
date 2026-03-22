FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY apps/notification-service/package.json ./

# Install dependencies
RUN pnpm install

# Copy source
COPY apps/notification-service/ .

# Expose port (ensure it matches the app's port)
EXPOSE 3001

CMD ["npm", "start"]
