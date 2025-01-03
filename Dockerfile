# Build stage
FROM node:20-alpine as build

ARG PORT=8080
ARG VITE_AZURE_OPENAI_API_KEY
ARG VITE_AZURE_OPENAI_ENDPOINT
ARG VITE_AZURE_OPENAI_VOICE_DEPLOYMENT_NAME
ARG VITE_AZURE_OPENAI_GENERAL_DEPLOYMENT_NAME

ENV PORT=${PORT}
ENV VITE_AZURE_OPENAI_API_KEY=${VITE_AZURE_OPENAI_API_KEY}
ENV VITE_AZURE_OPENAI_ENDPOINT=${VITE_AZURE_OPENAI_ENDPOINT}
ENV VITE_AZURE_OPENAI_VOICE_DEPLOYMENT_NAME=${VITE_AZURE_OPENAI_VOICE_DEPLOYMENT_NAME}
ENV VITE_AZURE_OPENAI_GENERAL_DEPLOYMENT_NAME=${VITE_AZURE_OPENAI_GENERAL_DEPLOYMENT_NAME}
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
EXPOSE ${PORT}

# Start the server
# Using PORT environment variable which Azure Web Apps will provide
CMD serve -s dist -l ${PORT}
