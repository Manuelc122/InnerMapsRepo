#!/bin/bash

# Setup script for InnerMaps Memory Service
echo "Setting up InnerMaps Memory Service..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 16+ before continuing."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm before continuing."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install @supabase/supabase-js dotenv

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "VITE_SUPABASE_URL=" > .env
    echo "VITE_SUPABASE_ANON_KEY=" >> .env
    echo "VITE_OPENAI_API_KEY=" >> .env
    echo ".env file created. Please edit it to add your API keys."
else
    echo ".env file already exists."
fi

# Ask if user wants to install PM2
read -p "Do you want to install PM2 for process management? (y/n) " install_pm2
if [ "$install_pm2" = "y" ]; then
    echo "Installing PM2..."
    npm install -g pm2
    
    # Ask if user wants to start the service with PM2
    read -p "Do you want to start the memory service with PM2? (y/n) " start_service
    if [ "$start_service" = "y" ]; then
        echo "Starting memory service with PM2..."
        pm2 start scripts/cron-job.js --name memory-service
        
        # Ask if user wants to set up PM2 to start on boot
        read -p "Do you want PM2 to start on system boot? (y/n) " pm2_startup
        if [ "$pm2_startup" = "y" ]; then
            echo "Setting up PM2 to start on boot..."
            pm2 startup
            pm2 save
        fi
    fi
fi

# Ask if user wants to set up systemd service
read -p "Do you want to set up a systemd service? (y/n) " setup_systemd
if [ "$setup_systemd" = "y" ]; then
    echo "Setting up systemd service..."
    
    # Get username
    username=$(whoami)
    
    # Get current directory
    current_dir=$(pwd)
    
    # Update the service file
    sed -i "s|YOUR_USERNAME|$username|g" scripts/memory-service.service
    sed -i "s|/path/to/your/InnerMapsRepo|$current_dir|g" scripts/memory-service.service
    
    echo "Please enter your Supabase URL:"
    read supabase_url
    sed -i "s|your_supabase_url|$supabase_url|g" scripts/memory-service.service
    
    echo "Please enter your Supabase Anon Key:"
    read supabase_anon_key
    sed -i "s|your_supabase_anon_key|$supabase_anon_key|g" scripts/memory-service.service
    
    echo "Please enter your OpenAI API Key:"
    read openai_api_key
    sed -i "s|your_openai_api_key|$openai_api_key|g" scripts/memory-service.service
    
    echo "Service file updated. To install the service, run:"
    echo "sudo cp scripts/memory-service.service /etc/systemd/system/"
    echo "sudo systemctl daemon-reload"
    echo "sudo systemctl enable memory-service"
    echo "sudo systemctl start memory-service"
fi

# Ask if user wants to run the service now
read -p "Do you want to run the memory service now? (y/n) " run_now
if [ "$run_now" = "y" ]; then
    echo "Running memory service..."
    node scripts/cron-job.js
fi

echo "Setup complete!"
echo "For more information, please read MEMORY_SERVICE_README.md" 