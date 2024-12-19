# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) for dependency installation
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the source code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Build the Vite project (if needed)
RUN npm run build

# Start the app in development mode
CMD ["npm", "run", "dev"]
