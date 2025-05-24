#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Get the environment type from the first argument (default to 'dev' if not provided)
ENV_TYPE=${1:-dev}

# Define paths
ENV_FILES_DIR="/var/www/env-files"
PROJECT_DIR="/var/www/frontend-${ENV_TYPE}"
NGINX_DIR="/var/www/html"  # Same directory for both dev and prod
ENV_FILE="${ENV_FILES_DIR}/.env.${ENV_TYPE}"
TARGET_ENV_FILE="${PROJECT_DIR}/.env"

# Display which environment is being deployed
echo "Deploying to the ${ENV_TYPE} environment..."

# Ensure the env-files directory exists
echo "Ensuring ${ENV_FILES_DIR} exists..."
sudo mkdir -p "${ENV_FILES_DIR}"

# Check if .env file for the environment exists in the env-files directory, and create an empty one if it doesn't
if [ ! -f "${ENV_FILE}" ]; then
  echo ".env.${ENV_TYPE} does not exist in ${ENV_FILES_DIR}. Creating an empty one..."
  sudo touch "${ENV_FILE}"
else
  echo ".env.${ENV_TYPE} already exists in ${ENV_FILES_DIR}."
fi

# Copy the environment-specific .env file if it exists
if [ -f "${ENV_FILE}" ]; then
  echo "Copying .env.${ENV_TYPE} from ${ENV_FILES_DIR} to ${PROJECT_DIR}..."
  cp "${ENV_FILE}" "${TARGET_ENV_FILE}"
fi

# Navigate to the project directory
cd "${PROJECT_DIR}"

# Clean up node_modules and package-lock.json to avoid potential dependency issues
echo "Removing node_modules and package-lock.json for a clean installation..."
rm -rf node_modules package-lock.json

# Install dependencies
echo "Installing npm dependencies..."
npm install --legacy-peer-deps || { echo "npm install failed"; exit 1; }

# Build the project for both dev and prod
echo "Building the project for ${ENV_TYPE}..."
npm run build || { echo "npm run build failed"; exit 1; }

# Ensure that the target Nginx directory exists and clean up old files
echo "Ensuring ${NGINX_DIR} directory exists..."
sudo mkdir -p "${NGINX_DIR}"
echo "Cleaning up old files in ${NGINX_DIR}..."
sudo rm -rf "${NGINX_DIR}"/*

# Copy the new build files to the Nginx root directory
echo "Copying new build files to ${NGINX_DIR}..."
sudo cp -r dist/* "${NGINX_DIR}/"

# Restart Nginx to serve the new files
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Deployment to ${ENV_TYPE} environment completed successfully!"