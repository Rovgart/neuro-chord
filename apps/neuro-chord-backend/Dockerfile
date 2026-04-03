FROM oven/bun:latest

WORKDIR /app

# 1. Instalacja CLI globalnie
RUN bun add -g @nestjs/cli

# 2. KOPIOWANIE KONFIGURACJI ROOT (Kluczowy krok!)
# Kopiujemy wszystko, co definiuje projekt (tsconfig, package.json, nest-cli.json)
COPY package.json bun.lockb* ./apps/tsconfig*.json nest-cli.json* ./

# 3. Kopiujemy folder aplikacji (i ewentualne biblioteki shared!)
# Jeśli masz folder libs/, też go dodaj: COPY libs/ ./libs/
COPY apps/neuro-chord-backend/ ./apps/neuro-chord-backend/

# 4. Instalacja paczek (Bun sam ogarnie workspaces)
RUN bun install

# 5. Generowanie Prismy (jeśli używasz)
# Ścieżka musi być precyzyjna względem WORKDIR
RUN bun x prisma generate --schema=./apps/neuro-chord-backend/src/prisma/schema.prisma

# 6. Eksponujemy port
EXPOSE 3000

# 7. Startujemy wskazując konkretny projekt
CMD ["nest", "start", "--watch", "neuro-chord-backend"]