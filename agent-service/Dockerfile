# Use a lightweight base image suitable for Node.js applications
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Convert TypeScript to JavaScript
RUN npm run build

# Expose the port your app listens on
EXPOSE 3000

# Define the command to start your application when the CONTAINER starts
CMD ["npm", "run", "start:docker"]
