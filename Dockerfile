FROM node:22-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "dev"]
