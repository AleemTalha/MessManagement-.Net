# Use official .NET 10 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /app

# Install libgssapi_krb5 dependency for PostgreSQL/Kerberos
RUN apt-get update && apt-get install -y libkrb5-dev

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and publish explicitly targeting the project
COPY . ./
RUN dotnet publish backned.csproj -c Release -o out

# Use runtime image for running the app
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

# Install libgssapi_krb5 in runtime as well
RUN apt-get update && apt-get install -y libkrb5-dev

COPY --from=build /app/out .

# Use Render's PORT environment variable
ENV ASPNETCORE_URLS=http://+:$PORT

# Start the application
ENTRYPOINT ["dotnet", "backned.dll"]
