#!/bin/bash

# Check if SUPABASE_URL and SUPABASE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  # Try to load from .env file
  if [ -f .env ]; then
    source .env
    export VITE_SUPABASE_URL
    export VITE_SUPABASE_ANON_KEY
    SUPABASE_URL=$VITE_SUPABASE_URL
    SUPABASE_KEY=$VITE_SUPABASE_ANON_KEY
  else
    echo "Error: SUPABASE_URL and SUPABASE_KEY environment variables are required."
    echo "Please set them or create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    exit 1
  fi
fi

echo "Creating chat tables in Supabase..."

# Execute the SQL script using the Supabase REST API
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "query": "$(cat scripts/create_chat_tables.sql | tr '\n' ' ')"
}
EOF

echo -e "\nChat tables created successfully!" 