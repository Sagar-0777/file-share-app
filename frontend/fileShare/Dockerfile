# Use Node.js base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Start Vite in host mode
CMD ["npm", "run", "dev", "--", "--host"]
