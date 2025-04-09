#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u
# Prevent errors in pipelines from being masked.
set -o pipefail

# --- Configuration Variables ---
# GitHub repository URL (publicly accessible)
REPO_URL="https://github.com/xinyuanblue/xinyuanblue.github.io.git"
# The domain name you will use (used for config file name and server_name)
DOMAIN_NAME="heluoshuyuan.cn"
# The user running the web server (and whose home directory holds the site)
DEPLOY_USER="ec2-user"
# The directory where the site content will be cloned within the user's home
# Derived from REPO_URL usually, but set explicitly here for clarity
SITE_DIR_NAME="xinyuanblue.github.io"
# Full path to the target directory
TARGET_DIR="/home/${DEPLOY_USER}/${SITE_DIR_NAME}"
# Nginx configuration file path
NGINX_CONF_FILE="/etc/nginx/conf.d/${DOMAIN_NAME}.conf"

# --- Script Start ---
echo "Starting static website deployment..."

# 1. Update system packages
echo "Updating system packages..."
sudo yum update -y

# 2. Install Nginx and Git
echo "Installing Nginx and Git..."
sudo yum install nginx git -y

# 3. Start and enable Nginx service
echo "Starting and enabling Nginx service..."
sudo systemctl start nginx
sudo systemctl enable nginx

# 4. Clone the website repository
echo "Cloning repository from ${REPO_URL} to ${TARGET_DIR}..."
# Remove existing directory if it exists to ensure a clean clone for setup
# NOTE: For updates, you'd use 'git pull' instead inside the directory
if [ -d "$TARGET_DIR" ]; then
    echo "Removing existing directory: ${TARGET_DIR}"
    sudo rm -rf "$TARGET_DIR"
fi
# Clone as the DEPLOY_USER (no sudo here!) to ensure correct initial ownership
# Run in a subshell as the deploy user to handle permissions correctly if script run as root
sudo -u "$DEPLOY_USER" git clone "$REPO_URL" "$TARGET_DIR"
# Alternative if running the script as ec2-user directly:
# git clone "$REPO_URL" "$TARGET_DIR"

echo "Repository cloned successfully."

# 5. Create Nginx configuration file
echo "Creating Nginx configuration file: ${NGINX_CONF_FILE}"
# Use sudo with bash -c to write the file as root
sudo bash -c "cat <<EOF > ${NGINX_CONF_FILE}
# /etc/nginx/conf.d/${DOMAIN_NAME}.conf

# Server block to handle the main domain AND direct IP access (default)
server {
    # Add 'default_server' to make this block handle IP access
    listen 80 default_server;
    listen [::]:80 default_server; # Also for IPv6 if enabled

    # Add '_' to explicitly catch requests with no matching Host header (like IP access)
    # Keep '${DOMAIN_NAME}' so it also handles the domain when DNS is set up.
    server_name _ ${DOMAIN_NAME};

    # Path to your website files
    root ${TARGET_DIR}; # Use variable for path

    # Default file to serve
    index index.html;

    # Handles requests
    location / {
        try_files \$uri \$uri/ =404; # Escaped $uri to prevent shell expansion
    }

    # Optional: Cache static assets
    location ~* \\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)\$ { # Escaped . and $
        expires 1M;
        add_header Cache-Control \"public\";
        access_log off;
    }

    # Optional: Hide Nginx version
    server_tokens off;
}

# Keep the www redirect block separate
server {
    listen 80;
    listen [::]:80;
    server_name www.${DOMAIN_NAME};
    return 301 http://${DOMAIN_NAME}\$request_uri; # Escaped $request_uri
}
EOF"

echo "Nginx configuration created."

# 6. Set necessary directory permissions for Nginx
echo "Setting permissions for Nginx to access site directory..."
# Grant 'execute' permission to others for the user's home directory
sudo chmod o+x "/home/${DEPLOY_USER}/"

# 7. Ensure correct ownership of website files (optional but good practice)
echo "Ensuring correct ownership of website files..."
sudo chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${TARGET_DIR}"

# 8. Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# 9. Restart Nginx to apply changes
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "-----------------------------------------------------"
echo "Deployment script finished successfully!"
echo "You should now be able to access your site via the Public IP."
echo "Remember to point your domain (${DOMAIN_NAME})'s DNS A record to this server's IP."
echo "-----------------------------------------------------"

exit 0