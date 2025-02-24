#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    touch .env
fi

# Prompt for API keys
read -p "Enter your Supabase URL: " supabase_url
read -p "Enter your Supabase Anon Key: " supabase_anon_key
read -p "Enter your Deepseek API Key: " deepseek_api_key

# Write to .env file
echo "VITE_SUPABASE_URL=$supabase_url" > .env
echo "VITE_SUPABASE_ANON_KEY=$supabase_anon_key" >> .env
echo "VITE_DEEPSEEK_API_KEY=$deepseek_api_key" >> .env

echo "API keys have been set in .env file"
