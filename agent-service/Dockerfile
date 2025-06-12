# Stage 1: Build the TypeScript application
# Use a specific Bun version (Alpine for smaller size)
FROM oven/bun:1-alpine AS builder
LABEL stage="builder"

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and bun.lockb (Bun's lockfile)
COPY package.json bun.lock ./

# Install all dependencies (including devDependencies needed for build)
# Use 'bun install --frozen-lockfile' for deterministic installs based on lock file
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Convert TypeScript to JavaScript (Bun has built-in TypeScript support)
# This command should match the 'build' script in your package.json
RUN bun run build

# Stage 2: Create the final production image
# Use the same Bun Alpine base image for consistency
FROM oven/bun:1-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/bun.lock ./
RUN bun install --production --frozen-lockfile

COPY --from=builder /app/dist ./dist

# Expose the port your app listens on
EXPOSE 3000

# Define the command to start your application when the CONTAINER starts
CMD ["bun", "run", "dist/index.js"]

# Switch to the non-root user 'bun'
# Bun images typically provide a non-root 'bun' user (UID/GID 1000)
USER bun
