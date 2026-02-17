FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder
WORKDIR /build
COPY *.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=builder /app .
EXPOSE 8000
ENV ASPNETCORE_URLS=http://+:8000
ENTRYPOINT ["dotnet", "ValidaRFC.dll"]
