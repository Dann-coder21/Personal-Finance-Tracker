# Step 1: Choose a base image. 
# We use 'node:18-alpine' because it's lightweight and has Node.js pre-installed.
FROM node:18-alpine

# Step 2: Set the working directory inside the container.
# All subsequent commands will run in this folder.
WORKDIR /app

# Step 3: Copy 'package.json' and 'package-lock.json' first.
# This allows Docker to cache dependencies, making future builds faster.
COPY package*.json ./

# Step 4: Install the project dependencies.
RUN npm install

# Step 5: Copy the rest of your application code.
COPY . .

# Step 6: Inform Docker that the container listens on port 5000 at runtime.
EXPOSE 5000

# Step 7: The command to run your app.
CMD ["npm", "start"]
