# Step 1: Build Next.js app
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build the app for production
RUN npm run build

# Step 2: Run Next.js app in production
FROM node:22-alpine AS runner
WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables for runtime
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "node_modules/.bin/next", "start"]