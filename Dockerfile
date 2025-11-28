# Use Node.js 20 LTS as base image
FROM node:20-slim

# Install SQLite and curl (for health checks)
RUN apt-get update && apt-get install -y \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci && npm cache clean --force

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy application files
COPY . .

# Build the Next.js application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production && npm cache clean --force

# Copy database sync scripts
COPY scripts/sync-db.sh /usr/local/bin/sync-db.sh
COPY scripts/backup-db.sh /usr/local/bin/backup-db.sh
RUN chmod +x /usr/local/bin/sync-db.sh /usr/local/bin/backup-db.sh

# Create writable directory for SQLite database
# Cloud Run filesystem is ephemeral, but we'll use /data for local storage
# For production, database should be synced from Cloud Storage on startup
RUN mkdir -p /data && \
    chmod 777 /data

# Copy existing database if it exists locally (for initial setup)
# In production, database will be synced from Cloud Storage via sync-db.sh
RUN if [ -f dev.db ]; then cp dev.db /data/dev.db && chmod 666 /data/dev.db; fi || true
RUN if [ -f prisma/dev.db ]; then cp prisma/dev.db /data/dev.db && chmod 666 /data/dev.db; fi || true

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_URL="file:/data/dev.db"

# Health check (Cloud Run handles this automatically, but useful for local testing)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))" || exit 1

# Start the application
# 1. Ensure database directory exists
# 2. Run migrations (creates database if it doesn't exist)
# 3. Start Next.js server
# Note: For Cloud Storage sync, use Cloud Run Jobs or Cloud Functions (see CLOUD_DEPLOYMENT.md)
CMD ["sh", "-c", "mkdir -p /data && chmod 777 /data && npx prisma migrate deploy || true && npm start"]

