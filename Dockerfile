# Use the official Node.js image with version 22.11.0
FROM node:22.11.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose the port your application listens on
EXPOSE 4001

# Command to start the application
CMD ["npm", "start"]
