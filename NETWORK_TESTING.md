# Network Testing Guide

## For You (Developer)

### 1. Start the backend on all network interfaces:
```bash
cd backend
bash start_network.sh
```

### 2. Find your network IP:
```bash
bash get_network_ip.sh
```

This will show you something like `192.168.1.100` — share this with your friend.

### 3. Start the frontend (on your machine):
```bash
cd frontend
npm run dev
```

---

## For Your Friend

### 1. Get your developer's IP address
Your developer will give you an IP like: `192.168.1.100`

### 2. Access the app in your browser
Go to: `http://192.168.1.100:5173` (Vite dev server)

Or if you're testing the API directly: `http://192.168.1.100:8000`

### 3. Configure the API URL in Settings
When you open the app:
1. Go to **Settings** page
2. Change "API Base URL" to: `http://192.168.1.100:8000`
3. Click "Save Settings"

### 4. Now you can test!
- Create an account
- Add crypto assets
- View market performance
- Change theme/accent colors

---

## Troubleshooting

**"Connection refused" error?**
- Make sure the backend is running on your developer's machine
- Make sure you're using the correct IP (not `localhost`)
- Check your firewall settings

**Can't see the frontend?**
- The Vite dev server (port 5173) needs to be accessible on the network
- If needed, update Vite config to listen on `0.0.0.0` as well

**Network IP not showing?**
- Try: `ipconfig getifaddr en0` (for WiFi on macOS)
- Or: `ifconfig | grep inet`
