#!/bin/bash
# Start the backend API on all network interfaces (0.0.0.0)
# This allows your friend to access the API from their device on the same network

cd "$(dirname "$0")"

echo "Starting CoinLabs Backend API..."
echo ""
echo "The API will be available at:"
echo "  - Local: http://localhost:8000"
echo "  - Network: http://<YOUR_IP>:8000"
echo ""
echo "To find your IP, run: bash get_network_ip.sh"
echo ""

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "✓ Virtual environment activated"
fi

# Start uvicorn on 0.0.0.0 so it's accessible from the network
echo "Starting uvicorn on 0.0.0.0:8000..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
