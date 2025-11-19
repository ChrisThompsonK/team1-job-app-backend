# Multi-stage build: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Production stage
FROM node:20-alpine

# Metadata
ARG VERSION
LABEL maintainer="team1-job-app-backend"
LABEL version="${VERSION}"
LABEL description="Job Application Backend API"

WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json ./

# Install all dependencies (including dev for db:setup to work)
RUN npm ci && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy minimal source needed for db:setup
COPY src/db ./src/db
COPY src/config ./src/config
COPY src/utils ./src/utils

# Copy migration SQL files
COPY drizzle ./drizzle

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser && \
    chown -R appuser:appgroup /app

USER appuser

# Health check using wget (built into alpine busybox)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/ || exit 1

# Start application - run migrations and seeds first, then start server
CMD ["sh", "-c", "npm run db:setup && node dist/server.js"]
