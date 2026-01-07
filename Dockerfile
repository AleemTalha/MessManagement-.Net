# Use official .NET 10 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /app

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and publish explicitly targeting the project
COPY . ./
RUN dotnet publish backned.csproj -c Release -o out

# Use runtime image for running the app
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app
COPY --from=build /app/out .

# Expose the port your backend runs on
EXPOSE 5205

# Start the application
ENTRYPOINT ["dotnet", "backned.dll"]
