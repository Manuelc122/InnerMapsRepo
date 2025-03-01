# Memory Service Setup Guide

This guide will walk you through setting up the InnerMaps Memory Service, which automatically processes memories that need embeddings.

## What We've Created

1. **SQL Scripts**:
   - `scripts/setup_memory_system.sql`: Sets up the entire memory system, including tables, triggers, and functions.
   - `scripts/update_memory_trigger.sql`: Updates the trigger to set the `needs_embedding` flag.

2. **Processing Scripts**:
   - `scripts/process_embeddings_job.js`: Processes memories that need embeddings.
   - `scripts/generate_embeddings.js`: Generates embeddings for existing memories.
   - `scripts/cron-job.js`: Runs the processing job at regular intervals.

3. **Monitoring Tools**:
   - `scripts/memory_dashboard.js`: Provides a real-time dashboard for monitoring the memory service.
   - `scripts/test_memory_service.js`: Tests if the memory service is working correctly.

4. **Deployment Options**:
   - `scripts/memory-service.service`: Systemd service file for Linux systems.
   - `Dockerfile.memory-service`: Docker configuration for containerized deployment.
   - `docker-compose.memory-service.yml`: Docker Compose configuration for easy deployment.

5. **Setup Scripts**:
   - `scripts/setup_memory_service.sh`: Interactive setup script for the memory service.

## Setup Instructions

### 1. Run the SQL Setup Script

First, run the SQL setup script to create the necessary database objects:

1. Go to the Supabase SQL Editor
2. Copy and paste the contents of `scripts/setup_memory_system.sql`
3. Run the script

### 2. Set Up Environment Variables

Create a `.env` file in your project root with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

You can add the service key interactively using:

```bash
npm run prompt-service-key
```

This will prompt you to enter your service key and add it to the `.env` file.

### 3. Install Dependencies

Install the required dependencies:

```bash
npm install @supabase/supabase-js dotenv
```

### 4. Process Existing Memories

If you have existing memories without embeddings, run:

```bash
npm run process-embeddings
```

### 5. Start the Memory Service

You have several options for running the memory service:

#### Option A: Interactive Setup

Run the interactive setup script:

```bash
npm run setup-memory-service
```

This will guide you through the setup process and offer various deployment options.

#### Option B: Manual Start

Start the cron job manually:

```bash
npm run start-cron
```

#### Option C: PM2 (Production)

If you have PM2 installed:

```bash
npm run start-memory-service
```

#### Option D: Docker (Containerized)

Build and run with Docker Compose:

```bash
docker-compose -f docker-compose.memory-service.yml up -d
```

### 6. Monitor the Service

Use the built-in dashboard to monitor the memory service:

```bash
npm run memory-dashboard
```

### 7. Test the Service

To test if the memory service is working correctly:

```bash
npm run test-memory-service
```

## Troubleshooting

If you encounter issues:

1. Check if your service key is working:
   ```bash
   npm run check-service-key
   ```

2. If the service key is not set or not working, add it:
   ```bash
   npm run prompt-service-key
   ```

3. Check the database connection:
   ```bash
   npm run check-db
   ```

4. Check if tables exist and have the correct structure:
   ```bash
   npm run check-tables
   ```

5. Check if RLS policies are affecting access:
   ```bash
   npm run check-rls
   ```

6. Create a test journal entry to verify the trigger:
   ```bash
   npm run create-test-entry
   ```

7. Manually create memories for existing journal entries:
   ```bash
   npm run create-memories
   ```

8. Run the memory service directly:
   ```bash
   npm run run-memory-service
   ```

For more detailed information, refer to `MEMORY_SERVICE_README.md`.

## Next Steps

1. **Fine-tune the service**: Adjust the processing interval in `scripts/cron-job.js` if needed.
2. **Set up monitoring alerts**: Consider setting up alerts for when the memory processing queue gets too large.
3. **Integrate with CI/CD**: If you're using CI/CD, consider adding the memory service to your deployment pipeline.

## Conclusion

You now have a fully functional memory service that automatically processes memories that need embeddings. This service will run in the background and ensure that all memories have embeddings for efficient retrieval.

For any questions or issues, please refer to the detailed documentation in `MEMORY_SERVICE_README.md`. 