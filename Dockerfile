# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/tsconfig.json ./apps/api/
COPY apps/web/package.json apps/web/tsconfig.json apps/web/vite.config.ts ./apps/web/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/api/src ./apps/api/src
COPY apps/api/drizzle.config.ts ./apps/api/
COPY apps/web/src ./apps/web/src
COPY apps/web/index.html ./apps/web/

# Build
RUN pnpm -r build

# Copy SQL migration files into the compiled dist (tsc doesn't copy .sql files)
RUN cp -r apps/api/src/db/migrations apps/api/dist/db/migrations

# Stage 2: Runtime
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files for production install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Install production deps only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Data volume
VOLUME /app/data

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
