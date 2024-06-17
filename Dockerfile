    # Use the official Node.js image as a base
    FROM node:20

    # Create and change to the app directory
    WORKDIR /usr/src/app

    # Install app dependencies
    COPY package*.json ./
    RUN npm install

    # Copy the rest of the application code
    COPY . .

    # Build the TypeScript code
    RUN npm run build

    # Expose the port the app runs on
    EXPOSE 8080

    # Start the app
    CMD ["npm", "start"]
