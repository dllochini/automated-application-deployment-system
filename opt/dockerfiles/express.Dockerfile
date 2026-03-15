# /opt/dockerfiles/express.Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
#RUN npm install --legacy-peer-deps
RUN npm ci --legacy-peer-deps

COPY . .

# Expose port (Jenkins sets 3000)
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]