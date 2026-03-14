# ===================================================================
# Stage 1: Build the React Application
# ===================================================================
FROM node:18-alpine AS builder

# Set the working directory for the build process
WORKDIR /app

# Copy package files first to leverage Docker's layer caching
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

ARG VITE_API_BASE_URL
ARG VITE_API_SOCKET_BASE_URL
ARG VITE_APP_LOCALSTORAGE_KEY

# --- NEW SECTION: Set Environment Variables for Vite ---
# This makes the ARGs available to the 'npm run build' process
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_SOCKET_BASE_URL=$VITE_API_SOCKET_BASE_URL
ENV VITE_APP_LOCALSTORAGE_KEY=$VITE_APP_LOCALSTORAGE_KEY
# Build the application for production.
# Vite will place the optimized static files in the /app/dist directory.
RUN npm run build

# ===================================================================
# Stage 2: Serve the Static Files with NGINX
# ===================================================================
FROM nginx:1.25-alpine

# Copy the custom NGINX configuration file into the container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the 'builder' stage to NGINX's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80, which is the default port for NGINX
EXPOSE 80

# The default NGINX command will start the server automatically
CMD ["nginx", "-g", "daemon off;"]

