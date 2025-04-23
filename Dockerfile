# Use Node.js base image
FROM node:20

# Set working directory in container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Expose the app's port
EXPOSE 5000

# Run the app
CMD ["npm", "start"]
