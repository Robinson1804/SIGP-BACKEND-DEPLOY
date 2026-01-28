# =============================================================================
# SIGP Backend - Dockerfile
# Multi-stage build for development and production
# =============================================================================

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# =============================================================================
# Production stage
# =============================================================================
FROM node:20-alpine AS production
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3010/api/v1 || exit 1

# Start application
CMD ["node", "dist/main.js"]

# =============================================================================
# Development stage
# =============================================================================
FROM node:20-alpine AS development
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 3010

# Start in development mode
CMD ["npm", "run", "start:dev"]
