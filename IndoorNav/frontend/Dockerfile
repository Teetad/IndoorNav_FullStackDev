# Use the official Node.js 24 image (Alpine version) as the build environment
FROM node:24-alpine AS builder

# Install the libc6-compat package for better compatibility with some Node.js native modules
# See: https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat

# Enable corepack, which helps manage package managers like pnpm
RUN corepack enable
RUN corepack prepare pnpm@11.9.0 --activate

# Set the working directory inside the container to /app
WORKDIR /app

# Copy all files from your project directory into the container's /app directory
COPY . .

# Install project dependencies using pnpm
RUN pnpm install

# Build the application (for example, compiles source code and bundles files)
RUN pnpm run build

# Use the official Nginx image (Alpine version) for serving the built app
FROM nginx:1.31.2-alpine AS production

# Copy the Nginx configuration template into the correct directory inside the container
COPY ./nginx.conf.template /etc/nginx/templates/nginx.conf.template

# Copy the built application files from the builder stage to the directory Nginx serves static files from
COPY --from=builder /app/dist /usr/share/nginx/html