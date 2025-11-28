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
RUN npm ci || npm install
RUN npm cache clean --force

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy all application files (respects .dockerignore)
# This will copy: app/, components/, lib/, public/, config files, etc.
COPY . .

# Copy database sync scripts to system bin (if they exist)
RUN if [ -f scripts/sync-db.sh ]; then \
      cp scripts/sync-db.sh /usr/local/bin/sync-db.sh && \
      chmod +x /usr/local/bin/sync-db.sh; \
    fi
RUN if [ -f scripts/backup-db.sh ]; then \
      cp scripts/backup-db.sh /usr/local/bin/backup-db.sh && \
      chmod +x /usr/local/bin/backup-db.sh; \
    fi

# Build the Next.js application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production && npm cache clean --force

# Create writable directory for SQLite database
RUN mkdir -p /data && chmod 777 /data

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
CMD ["sh", "-c", "mkdir -p /data && chmod 777 /data && npx prisma migrate deploy || true && npm start"]
