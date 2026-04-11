FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 3000
EXPOSE 3002

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["neuro-chord-prod-backend/neuro-chord-prod-backend.csproj", "neuro-chord-prod-backend/"]
RUN dotnet restore "neuro-chord-prod-backend/neuro-chord-prod-backend.csproj"
COPY . .
WORKDIR "/src/neuro-chord-prod-backend"
RUN dotnet build "./neuro-chord-prod-backend.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN ls -R && dotnet publish "neuro-chord-prod-backend/neuro-chord-prod-backend.csproj" -c Release -o /app/out
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "neuro-chord-prod-backend.dll"]
