# ============================================================
# Medical Distribution System - Production Dockerfile
# ============================================================

# ============================================================
# Stage 1: Backend
# ============================================================
FROM node:20-alpine AS backend

WORKDIR /app/backend

# Native build tools required by better-sqlite3
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite-dev

# Copy backend package files
COPY backend/package.json backend/package-lock.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend application
COPY backend/dist ./dist
COPY backend/database ./database
COPY backend/scripts ./scripts
COPY backend/reset-admin.mjs ./

# Create required directories
RUN mkdir -p uploads data


# ============================================================
# Stage 2: Frontend
# ============================================================
FROM node:20-alpine AS frontend

WORKDIR /app/frontend

# Copy frontend package
COPY frontend/package.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy Next.js build output
COPY frontend/.next ./.next
COPY frontend/public ./public
COPY frontend/next.config.mjs ./


# ============================================================
# Stage 3: Production
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy backend
COPY --from=backend /app/backend ./backend

# Copy frontend
COPY --from=frontend /app/frontend ./frontend

# Copy startup files
COPY package.json ./
COPY start.mjs ./

# Expose application ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3001/health || exit 1

# Start application
CMD ["node", "start.mjs"]