# --- Stage 1: Build the React App ---
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# 1. Define the build argument for the API key
ARG GEMINI_API_KEY

# 2. Write the key to .env.local so Vite can use it during the build
# Note: Vite usually requires variables to start with VITE_ to be visible in the browser.
# If your app expects VITE_GEMINI_API_KEY, change the line below accordingly.
RUN echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local

# Build the application
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx: alpine

# Copy the build output from the previous stage to Nginx's folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run expects the container to listen on port 8080
EXPOSE 8080

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
