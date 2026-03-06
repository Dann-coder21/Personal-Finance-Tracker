# STAGE 1: Build the app
# Use Node to install dependencies and 'build' the static files.
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# This creates a 'dist' folder with your website.
RUN npm run build

# STAGE 2: Serve the app
# We don't need Node anymore! We use 'nginx', a fast web server.
FROM nginx:alpine

# Copy the 'dist' folder from the first stage into Nginx's folder.
COPY --from=build /app/dist /usr/share/nginx/html

# Inform Docker that the web server is on port 80.
EXPOSE 80

# Start Nginx.
CMD ["nginx", "-g", "daemon off;"]
