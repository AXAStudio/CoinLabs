#!/bin/bash
# Get local network IP address for sharing with others

echo "=== Your Network IP Addresses ==="
echo ""

# Get all IPv4 addresses except localhost
ifconfig | grep -E "inet [0-9]" | grep -v "127.0.0.1" | awk '{print $2}'

echo ""
echo "Share one of these IPs with your friend:"
echo "http://<YOUR_IP>:8000"
echo ""
echo "Example: http://192.168.1.100:8000"
