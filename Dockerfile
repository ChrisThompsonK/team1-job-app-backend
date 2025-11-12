# Multi-stage build: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies needed for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (needed for build and migrations)
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only (smaller image)
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy drizzle migrations and configuration
COPY drizzle ./drizzle
COPY drizzle.config.ts ./

# Expose port (3001 as configured in env)
EXPOSE 3001

# Create a non-root user and give ownership of the app directory
# We create the user after installing deps so installs run as root,
# then change ownership and switch to the unprivileged user for runtime.
RUN addgroup -S app \
  && adduser -S -G app -u 1000 app \
  && chown -R app:app /app

# Switch to the non-root user
USER app

# Health check (port 3001 is internal to container)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start the application (run compiled migration script from dist)
# This avoids installing tsx globally at runtime and keeps the final image smaller.
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/server.js"]
