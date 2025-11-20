#!/bin/bash
# Startup script for Render backend
# Loads environment variables from .env (if present locally) and starts the app

set -e

# Load environment from .env if it exists (useful for local testing)
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

# Start the FastAPI application
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
