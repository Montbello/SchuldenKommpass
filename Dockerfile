# Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app

# Copy common package first (workspace dependency)
COPY common /app/common

# Copy backend files
WORKDIR /app/backend
COPY backend/package*.json ./

# Install with legacy-peer-deps to handle workspace dependency
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/tsconfig.json ./
COPY backend/src ./src/
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy common (needed at runtime for types)
COPY --from=backend-builder /app/common ./common

# Copy backend
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend/package*.json ./

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
