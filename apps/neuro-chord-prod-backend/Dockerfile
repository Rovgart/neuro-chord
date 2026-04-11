# ETAP 1: Budowanie
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-env
WORKDIR /src

# 1. Kopiujemy pliki projektów zachowując strukturę folderów
COPY NeuroChordDomain/*.csproj ./NeuroChordDomain/
COPY NeuroChord.Infrastructure/*.csproj ./NeuroChord.Infrastructure/
COPY NeuroChord.Application/*.csproj ./NeuroChord.Application/
COPY neuro-chord-prod-backend/*.csproj ./neuro-chord-prod-backend/

# 2. Przywracamy zależności
RUN dotnet restore "neuro-chord-prod-backend/neuro-chord-prod-backend.csproj"

# 3. KLUCZOWY MOMENT: Kopiujemy CAŁĄ resztę kodu
COPY . .

# 4. Publikujemy (Zauważ, że nie zmieniamy już WORKDIR - podajemy ścieżkę do projektu)
RUN dotnet publish "neuro-chord-prod-backend/neuro-chord-prod-backend.csproj" -c Release -o /app/out

# ETAP 2: Uruchamianie
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app
COPY --from=build-env /app/out .

RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

ENTRYPOINT ["dotnet", "neuro-chord-prod-backend.dll"]