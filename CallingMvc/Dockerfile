# Step 1: Use the official .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory in the container
WORKDIR /src

# Copy the .csproj and restore any dependencies (via `dotnet restore`)
COPY ["CallingMvc/CallingMvc.csproj", "CallingMvc/"]

# Restore dependencies
RUN dotnet restore "CallingMvc/CallingMvc.csproj"

# Copy the rest of the application code
COPY . .

# Step 2: Build the project
WORKDIR /src/CallingMvc
RUN dotnet publish "CallingMvc.csproj" -c Release -o /app/publish

# Step 3: Use the official .NET runtime image to run the app
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base

# Set the working directory in the container
WORKDIR /app

# Copy the published app from the build container
COPY --from=build /app/publish .

# Expose the port the app will run on
EXPOSE 80

# Set the entry point to the application
ENTRYPOINT ["dotnet", "CallingMvc.dll"]
