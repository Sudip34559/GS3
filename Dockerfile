# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install deps
COPY package*.json ./
RUN npm install --production

# Copy the rest of the code
COPY . .

# Expose your app port (Express usually runs on 3000)
EXPOSE 3000

# Start your app
CMD ["npm", "start"]
