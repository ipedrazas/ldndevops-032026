FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json vitest.config.ts ./
COPY src/ src/
COPY docs/ docs/

RUN npm run build

# --- Production image ---
FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist/ dist/
COPY docs/ docs/

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["node", "dist/cli/index.js"]
CMD ["serve"]
