# Dockerfile for VisualGenie2 (Node.js + React + Express)
FROM node:22

WORKDIR /app

COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm install --legacy-peer-deps

COPY . .

# Build client and server
RUN npm run build

# Expose port (default: 5000)
EXPOSE 5000

# Run migration and start server
CMD npm run db:push && npm run start
