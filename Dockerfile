# Use Node.js 20 LTS as base image
FROM node:20-slim

# Install curl (for health checks)
# MongoDB connection is handled by Prisma, no need for local MongoDB installation
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema and migrations BEFORE npm install
# (needed because postinstall script runs prisma generate)
COPY prisma ./prisma

# Install all dependencies (needed for build)
# The postinstall script will run prisma generate automatically
RUN npm ci || npm install
RUN npm cache clean --force

# Copy all application files (respects .dockerignore)
# This will copy: app/, components/, lib/, public/, config files, etc.
COPY . .

# MongoDB doesn't need local database sync scripts

# Build the Next.js application
RUN npm run build

# Remove dev dependencies to reduce image size
# Keep TypeScript and ts-node as Next.js needs them (TypeScript for config, ts-node for seeding)
RUN npm install --save typescript ts-node && npm prune --production && npm cache clean --force

# MongoDB Atlas is cloud-hosted, no local database directory needed

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
# DATABASE_URL will be set via Cloud Run environment variables

# Health check (Cloud Run handles this automatically, but useful for local testing)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))" || exit 1

# Start the application
# Ensure PORT is set (Cloud Run sets this automatically)
# Next.js 16 automatically uses PORT env var, but we'll be explicit
# MongoDB doesn't use Prisma migrations, so we skip migrate deploy
# Auto-seed database if empty (only on first run)
CMD ["sh", "-c", "npx prisma db push || true && (npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts || true) && PORT=${PORT:-8080} npm start"]
