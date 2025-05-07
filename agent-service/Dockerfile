# Use a lightweight base image for Bun
FROM oven/bun:latest AS bun-build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json .

# Install dependencies using bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Convert TypeScript to JavaScript (Bun has built-in TypeScript support)
RUN bun run build

# Expose the port your app listens on
EXPOSE 3000

# Define the command to start your application when the CONTAINER starts
CMD ["bun", "run", "start:docker:bun"]
