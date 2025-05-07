# Stage 1: Build the TypeScript application
# Use a specific Bun version (Alpine for smaller size)
FROM oven/bun:1-alpine AS builder
LABEL stage="builder"

# Set the working directory in the container
WORKDIR /app

# Copy package.json and bun.lockb
COPY package.json bun.lock ./

# Install all dependencies (including devDependencies needed for build)
# Use 'bun install --frozen-lockfile' for deterministic installs based on lock file
RUN bun install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript
# This command should match the 'build' script in your package.json
RUN bun run build

# Stage 2: Create the final production image
# Use the same Bun Alpine base image for consistency
FROM oven/bun:1-alpine

# Set the working directory
WORKDIR /app

# Set environment to production (good practice)
# ENV NODE_ENV=production

# Bun images typically provide a non-root 'bun' user (UID/GID 1000)
# No need to create one manually

# Copy package.json and lock file from the builder stage
COPY --from=builder /app/package.json /app/bun.lock ./

# Install ONLY production dependencies using the lock file
RUN bun install --production --frozen-lockfile

# Copy the compiled JavaScript code from the builder stage
COPY --from=builder /app/dist ./dist

# Create the 'data' directory where job files will be read/written
# Grant ownership to the 'bun' user so the application can write to it
# Note: This directory INSIDE the container should ideally be mounted
#       to a volume when running the container for persistence.
RUN mkdir data && chown bun:bun data

# Switch to the non-root user 'bun'
USER bun

# Expose port if your application listens on one (sender-service likely doesn't need this)
# EXPOSE 3000

# Define the command to run the application using Bun
# Uses the compiled JavaScript output in the 'dist' folder
CMD ["bun", "run", "dist/index.js"]
