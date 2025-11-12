FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with npm
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
