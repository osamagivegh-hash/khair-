# Use Node.js 20 LTS as base image
FROM node:20-slim

# Install curl (for health checks)
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema BEFORE npm install (needed for postinstall)
COPY prisma ./prisma

# Install dependencies
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
RUN npm cache clean --force

# Copy all application files
COPY . .

# Build the Next.js application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production && npm cache clean --force

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check with reasonable timeout
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/api/health || exit 1

# IMPORTANT: Start WITHOUT seeding
# Database seeding should be done ONCE via Cloud Run Jobs, NOT on every container startup
# This prevents CPU spikes that look like crypto mining to Google's systems
CMD ["sh", "-c", "PORT=${PORT:-8080} npm start"]
