# InnerMaps Memory Service

This service automatically processes memories that need embeddings. It runs in the background and periodically checks for new memories that need to be processed.

## Overview

The memory service consists of:

1. A SQL trigger that creates memories from journal entries
2. A background process that generates embeddings for these memories
3. Various deployment options for running this service

## Prerequisites

- Node.js 16+ installed
- Supabase project with the vector extension enabled
- OpenAI API key

## Setup Instructions

### 1. Database Setup

Make sure you've run the following SQL scripts in your Supabase SQL Editor:

```sql
-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the coach_memories table
CREATE TABLE IF NOT EXISTS public.coach_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  source_id UUID,
  source_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  embedding VECTOR(1536),
  needs_embedding BOOLEAN DEFAULT TRUE
);

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.generate_memory_from_journal()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.coach_memories (
    user_id,
    content,
    source_id,
    source_type,
    created_at,
    needs_embedding
  ) VALUES (
    NEW.user_id,
    NEW.content,
    NEW.id,
    'journal_entry',
    COALESCE(NEW.created_at, NEW.timestamp, now()),
    TRUE
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating memory: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER generate_memory_after_journal_insert
AFTER INSERT ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.generate_memory_from_journal();
```

### 2. Environment Setup

Create a `.env` file in your project root with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

The service key is required to bypass RLS policies and access the database directly. You can add it using:

```bash
npm run prompt-service-key
```

This will prompt you to enter your service key and add it to the `.env` file.

### 3. Running the Service

There are several ways to run the memory service:

#### Option 1: Manual Run (Development)

To process memories once:

```bash
npm run process-embeddings
```

To start the cron job that processes memories every 5 minutes:

```bash
npm run start-cron
```

#### Option 2: PM2 (Production)

Install PM2 globally:

```bash
npm install -g pm2
```

Start the memory service with PM2:

```bash
npm run start-memory-service
```

Or directly with PM2:

```bash
pm2 start scripts/cron-job.js --name memory-service
```

PM2 commands:

```bash
# Check status
pm2 status

# View logs
pm2 logs memory-service

# Restart service
pm2 restart memory-service

# Stop service
pm2 stop memory-service

# Set to start on system boot
pm2 startup
pm2 save
```

#### Option 3: Systemd Service (Linux)

1. Edit the `scripts/memory-service.service` file to update the paths and username
2. Copy the service file to systemd:

```bash
sudo cp scripts/memory-service.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable memory-service
sudo systemctl start memory-service
```

Check status:

```bash
sudo systemctl status memory-service
```

#### Option 4: Docker (Containerized)

Build and run with Docker Compose:

```bash
docker-compose -f docker-compose.memory-service.yml up -d
```

## Troubleshooting

If you're having trouble with the memory service, follow these steps to diagnose and fix the issues:

### 1. Check Database Connection

Run the database connection check to verify that your database is accessible:

```bash
npm run check-db
```

If this fails, it may be due to authentication issues or RLS (Row Level Security) policies.

### 2. Check the Service Key

To verify that your service key is working properly:

```bash
npm run check-service-key
```

If the service key is not set or not working, you can add or update it:

```bash
npm run prompt-service-key
```

### 3. Check Tables Directly

Run the direct database check to see if your tables contain data:

```bash
npm run direct-db-check
```

### 4. Create a Test Journal Entry

If no journal entries exist, create a test entry:

```bash
npm run create-test-entry
```

This will create a test journal entry and check if a memory is automatically created by the trigger.

### 5. Manually Create Memories

If the trigger isn't working, manually create memories for existing journal entries:

```bash
npm run create-memories
```

### 6. Process Embeddings

Process any memories that need embeddings:

```bash
npm run run-memory-service
```

### 7. Check RLS Policies

If you're still having trouble, check the RLS policies:

```bash
npm run check-rls
```

### 8. View Data in Supabase Dashboard

You can always view your data directly in the Supabase dashboard:

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to the "Table Editor" in the left sidebar
4. Select the `journal_entries` or `coach_memories` table

### 9. Run SQL Queries Directly

You can run SQL queries directly in the Supabase SQL Editor. See the `SUPABASE_INSTRUCTIONS.md` file for useful queries.

## Monitoring

To monitor the memory service, you can:

1. Check the logs as described above
2. Query the database to see how many memories need processing:

```sql
SELECT COUNT(*) FROM public.coach_memories WHERE needs_embedding = TRUE;
```

3. Check the most recent processed memories:

```sql
SELECT id, content, created_at 
FROM public.coach_memories 
WHERE needs_embedding = FALSE 
ORDER BY created_at DESC 
LIMIT 10;
```

4. Use the built-in dashboard:

```bash
npm run memory-dashboard
```

The dashboard provides a real-time view of:
- Total memory count
- Memories needing embeddings
- Memories with embeddings
- Completion rate
- Recent memories and their status
- Recently processed memories

The dashboard updates every 10 seconds and provides a convenient way to monitor the memory service.

## Customization

To change the processing interval, edit the `INTERVAL_MS` variable in `scripts/cron-job.js`.

## License

MIT