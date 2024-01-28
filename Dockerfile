# Use an official Node.js runtime based on Alpine
FROM node:14-alpine

# Install necessary dependencies
RUN apk add --no-cache python3 g++ make

# Set the working directory in the container
WORKDIR /

# Copy the entire application to the container
COPY . .

# Install app dependencies
RUN npm install --production

# Expose the port on which the app will run (adjust if needed)
EXPOSE 3000

# Define the command to run your application
CMD node server.js

