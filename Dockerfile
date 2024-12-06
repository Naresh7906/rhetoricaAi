# Build stage
FROM node:20-alpine as build

ARG PORT=8080

ENV PORT=${PORT}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Final stage
FROM node:20-alpine

WORKDIR /app

# Install serve package globally
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Expose port 8080 (Azure Web Apps expects this)
EXPOSE 8080

# Start the server
# Using PORT environment variable which Azure Web Apps will provide
CMD serve -s dist -l ${PORT}
