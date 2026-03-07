# /opt/dockerfiles/react.Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Build the React app
RUN npm run build

# Install serve to serve the build
RUN npm install -g serve

# Expose port (Jenkins sets 3000)
EXPOSE 3000

# Command to serve the build
CMD ["serve", "-s", "build", "-l", "3000"]