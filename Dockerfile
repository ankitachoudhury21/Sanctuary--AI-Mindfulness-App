# --- Stage 1: Build the App ---
# Use Node 20 on Alpine Linux (a very small, lightweight OS)
FROM node:20-alpine as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to install dependencies (better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of your source code
COPY . .

# --- SPECIAL STEP: Handle the API Key ---
# We declare that we expect an argument called SHOPIFY_API_KEY
ARG SHOPIFY_API_KEY

# We write this key into a .env.local file so Vite can use it during build
# Note: For Vite to see this, your code usually needs it to be prefixed with VITE_
# If your code uses import.meta.env.VITE_SHOPIFY_API_KEY, ensure the prefix matches.
RUN echo "SHOPIFY_API_KEY=$SHOPIFY_API_KEY" > .env.local

# Build the app (creates the 'dist' folder)
RUN npm run build

# --- Stage 2: Serve the App ---
# Use Nginx to serve the static files (lightweight and fast)
FROM nginx:alpine

# Copy the build output from the previous stage to Nginx's folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 to Google Cloud
EXPOSE 8080

# Start Nginx in the foreground so the container keeps running
CMD ["nginx", "-g", "daemon off;"]
