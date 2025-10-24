# Dockerfile for VisualGenie2 (Node.js + React + Express)
FROM node:22

WORKDIR /app

COPY package*.json ./
COPY . .

# Install dependencies
RUN npm install

# Build client
RUN npm run build

# Expose port (default: 5000)
EXPOSE 5000

# Start server
CMD ["bash", "-c", "npm run db:push && npm run start"]
