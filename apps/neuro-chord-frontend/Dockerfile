# ETAP 1: Instalacja zależności
FROM oven/bun:alpine AS deps
WORKDIR /app

# Kopiujemy tylko package.json, bo pliku lock nie ma
COPY package.json ./
RUN bun install

# ETAP 2: Budowanie aplikacji
FROM oven/bun:alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Budujemy Next.js (pamiętaj o output: 'standalone' w next.config.js)
RUN bun run build

# ETAP 3: Uruchamianie
FROM oven/bun:alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["bun", "server.js"]