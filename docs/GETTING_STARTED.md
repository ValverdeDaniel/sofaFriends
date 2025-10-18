# Getting Started with SofaFriends

Quick start guide to get SofaFriends up and running in minutes.

## Table of Contents
- [First Time Setup](#first-time-setup)
- [Starting the Game](#starting-the-game)
- [Multiplayer Mode (TV + Phones)](#multiplayer-mode-tv--phones)
- [Local Testing Mode (Keyboard Only)](#local-testing-mode-keyboard-only)
- [Stopping the Game](#stopping-the-game)
- [Troubleshooting](#troubleshooting)

---

## First Time Setup

### Prerequisites

Before you begin, make sure you have:
- ✅ Docker Desktop installed and running
- ✅ Project cloned to your computer
- ✅ Terminal/Command Prompt open

If you haven't installed Docker yet, see [SETUP.md](SETUP.md).

### Clone the Project

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate into the folder
cd sofafriends
```

### Verify Docker is Running

**Windows:** Look for whale icon in system tray (bottom right)
**macOS:** Look for whale icon in menu bar (top right)
**Linux:** Run `systemctl status docker`

If Docker isn't running, start Docker Desktop and wait for it to fully start.

---

## Starting the Game

### Step 1: Build and Start Services

Open a terminal in the project folder and run:

```bash
docker-compose up --build
```

**What happens:**
1. Downloads required Docker images (first time: ~2-3 minutes)
2. Builds the Python backend server
3. Starts Redis database
4. Starts 3 web servers (backend, host, controller)

**You'll see output like:**
```
✔ Container sofafriends-redis-1       Started
✔ Container sofafriends-server-1      Started
✔ Container sofafriends-host-1        Started
✔ Container sofafriends-controller-1  Started
```

**Wait for these lines:**
```
server-1      | INFO:     Uvicorn running on http://0.0.0.0:8000
host-1        | Starting up http-server, serving ./
controller-1  | Starting up http-server, serving ./
```

When you see these messages, the game is ready!

### Step 2: Open the Host Screen

**In your web browser, go to:**
```
http://localhost:9001
```

You should see:
- A 6-digit room code (e.g., `ABC123`)
- A QR code
- 8 empty player slots
- "Start Game" button (disabled until players join)
- "Test Locally (No Phone)" button

**Troubleshooting:**
- If page won't load, check Docker logs: `docker-compose logs host`
- Try refreshing the page
- Check that all containers are running: `docker ps`

---

## Multiplayer Mode (TV + Phones)

This is the full party game experience!

### Setup Your Host Screen

1. **Connect computer to TV (optional):**
   - Use HDMI cable to connect laptop to TV
   - Or just use your laptop screen

2. **Open host in fullscreen:**
   - Navigate to `http://localhost:9001`
   - Press `F11` for fullscreen
   - Note the room code displayed on screen

### Connect Phone Controllers

Players can join in two ways:

#### Method 1: Scan QR Code (Easiest)

1. Open camera app on phone
2. Point at QR code on TV screen
3. Tap notification to open browser
4. Enter your player name
5. Tap "Join Game"

#### Method 2: Manual Entry

1. **Find your computer's IP address:**

   **Windows:**
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" under WiFi adapter (e.g., `192.168.1.100`)

   **macOS:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

   **Linux:**
   ```bash
   hostname -I
   ```

2. **On your phone:**
   - Make sure phone is on **same WiFi** as computer
   - Open browser (Chrome/Safari)
   - Go to: `http://YOUR-IP:3001`
   - Example: `http://192.168.1.100:3001`

3. **Enter room code:**
   - Type the 6-digit code from TV screen
   - Enter your name
   - Tap "Join Game"

### Start Playing

1. **Wait for players to join:**
   - Each player appears in lobby with colored circle
   - Can have 1-8 players
   - Host screen shows all connected players

2. **Start the game:**
   - On host screen, click "Start Game" button
   - All phones will switch to controller view
   - Game begins immediately!

3. **Phone controls:**
   - **Left button:** Move left
   - **Right button:** Move right
   - **Jump button (^):** Jump
   - **Action button (O):** Reserved for future features

---

## Local Testing Mode (Keyboard Only)

Perfect for testing, solo play, or when phones aren't available.

### Starting Local Mode

1. **Open host screen:**
   ```
   http://localhost:9001
   ```

2. **Click "Test Locally (No Phone)":**
   - A modal appears asking "How many players?"
   - Choose 1 or 2 players
   - Click "Start"

3. **Game starts with keyboard controls:**
   - No WebSocket connection needed
   - No phone required
   - Great for development and debugging

### Keyboard Controls

**Player 1 (Blue):**
- `W` - Jump
- `A` - Move left
- `D` - Move right

**Player 2 (Red):**
- `↑` - Jump
- `←` - Move left
- `→` - Move right

**Control hints appear on screen during local mode.**

### When to Use Local Mode

- Testing new features
- Debugging game mechanics
- Solo playtesting levels
- No phone available
- Developing new levels
- Quick gameplay check

---

## Stopping the Game

### Graceful Shutdown

In the terminal where `docker-compose up` is running:

1. Press `Ctrl+C`
2. Wait for services to stop
3. Run cleanup:
   ```bash
   docker-compose down
   ```

### Force Stop

If services won't stop:

```bash
# Stop and remove all containers
docker-compose down --remove-orphans

# Nuclear option (removes all data)
docker-compose down -v
```

### Restart Without Rebuilding

```bash
# Quick restart
docker-compose restart

# Or stop and start
docker-compose stop
docker-compose start
```

---

## Troubleshooting

### Phone Can't Connect

**Check WiFi:**
- Phone and computer must be on **same network**
- Not guest WiFi or separate network
- Not cellular data - must be WiFi

**Check Firewall:**
- Windows: Allow port 3001 through firewall
- macOS: System Preferences → Security & Privacy → Firewall → Firewall Options → Allow incoming connections
- Try temporarily disabling firewall to test

**Check IP Address:**
- Make sure you're using correct IP
- Try pinging computer from phone
- Some routers have "client isolation" - disable it

**Check URL:**
- Must use `http://` not `https://`
- Must use IP, not `localhost` on phone
- Port must be `:3001`

### QR Code Not Showing

```bash
# Check backend is running
docker-compose logs server

# Check for errors in browser console
# Press F12 in browser, check Console tab

# Refresh the page
# Try accessing http://localhost:9001 directly
```

### Game Won't Start

**No players connected:**
- Need at least 1 controller connected
- Or use "Test Locally" mode

**Button disabled:**
- Wait for players to fully connect
- Check WebSocket connection (green indicator)
- Refresh host page and reconnect

**Backend not responding:**
```bash
# Check server logs
docker-compose logs -f server

# Restart backend
docker-compose restart server
```

### Performance Issues

**Lag or stuttering:**
- Close other applications
- Check Docker resource allocation (Docker Desktop → Settings → Resources)
- Reduce number of players
- Check network latency

**High CPU usage:**
```bash
# Check Docker resource usage
docker stats

# Increase allocated resources in Docker Desktop settings
```

### Port Conflicts

If you see "port already in use":

```bash
# Find what's using the port
netstat -ano | findstr :9000    # Windows
lsof -i :9000                   # macOS/Linux

# Stop the conflicting service
# Or change ports in docker-compose.yml
```

### Docker Issues

**Containers won't start:**
```bash
# View all logs
docker-compose logs

# View specific service
docker-compose logs server
docker-compose logs host

# Rebuild everything
docker-compose down -v
docker-compose up --build
```

**"No space left on device":**
```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

---

## Quick Reference

### URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Host Screen** | http://localhost:9001 | TV/monitor display |
| **Phone Controller** | http://YOUR-IP:3001 | Mobile controller |
| **Backend API** | http://localhost:9000 | WebSocket server |
| **Admin Panel** | http://localhost:9001/admin/test-panel.html | Testing tools |

### Commands

```bash
# Start game
docker-compose up --build

# Stop game
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart server

# Clean everything
docker-compose down -v
```

### Ports

- **9000** - Backend API server
- **9001** - Host client (TV screen)
- **3001** - Controller client (phones)
- **6379** - Redis (internal only)

---

## Next Steps

Now that the game is running:

1. **Learn to Play:**
   - Read [HOW_TO_PLAY.md](HOW_TO_PLAY.md) for gameplay guide
   - Understand controls and objectives

2. **Start Developing:**
   - See [DEVELOPMENT.md](DEVELOPMENT.md) for development guide
   - Learn how to add features and debug

3. **Invite Friends:**
   - Connect up to 8 phones
   - Play together cooperatively

---

**Previous:** [← Setup](SETUP.md) | **Next:** [How to Play →](HOW_TO_PLAY.md)
