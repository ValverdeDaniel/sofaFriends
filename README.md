# 🎮 SofaFriends

A Pico-Park-style couch co-op party game where one screen is the "stage" and up to 8 phones become controllers.

## 📋 Prerequisites & Setup

### 1. Install Docker Desktop

Docker Desktop includes both Docker and Docker Compose, making it the easiest way to get started.

**Windows:**
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Run the installer and follow the setup wizard
3. Restart your computer when prompted
4. Launch Docker Desktop and wait for it to start (whale icon in system tray)
5. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

**macOS:**
1. Download Docker Desktop for Mac: https://www.docker.com/products/docker-desktop/
2. Drag Docker.app to Applications folder
3. Launch Docker Desktop from Applications
4. Grant necessary permissions when prompted
5. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

**Linux (Ubuntu/Debian):**
```bash
# Install Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker --version
docker-compose --version
```

### 2. Setup Claude in VS Code (Optional - for AI assistance)

Claude Code is an AI coding assistant that can help you develop, debug, and understand the codebase.

**Installation:**
1. Open Visual Studio Code
2. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "Claude Code"
4. Click "Install" on the official Claude Code extension by Anthropic
5. After installation, open VS Code Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
6. Type `/login` and press Enter
7. Follow the authentication prompts in your browser
8. You'll need an active Claude subscription (Claude Pro or API access)

**Usage:**
- Press `Ctrl+L` (or `Cmd+L` on Mac) to open Claude chat
- Type `/` to see available commands
- Ask Claude questions about the code, request features, or get debugging help
- Claude can read your files, make edits, run commands, and more

**Useful commands:**
- `/help` - Get help with Claude Code features
- `/clear` - Clear conversation history
- Ask questions like "How does the WebSocket connection work?" or "Add a new level to the game"

### 3. Other Requirements
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Smartphone(s) on the same WiFi network as your computer (for multiplayer)

## 🚀 Quick Start

### Step 1: Clone and Navigate to Project
```bash
git clone <your-repo-url>
cd sofafriends
```

### Step 2: Start Docker Services

Make sure Docker Desktop is running (check for whale icon in system tray), then:

```bash
docker-compose up --build
```

This command will:
- Download necessary Docker images (first time only)
- Build the Python backend server
- Start Redis database for room management
- Start host client web server (port 9001)
- Start controller client web server (port 3001)
- Start backend API (port 9000)

**Note:** First run may take 2-3 minutes to download images and build. Subsequent runs are much faster.

You should see output like:
```
✔ Container sofafriends-redis-1       Started
✔ Container sofafriends-server-1      Started
✔ Container sofafriends-host-1        Started
✔ Container sofafriends-controller-1  Started
```

### Step 3: Open the Game

**Option A: Full Multiplayer Mode (TV + Phones)**

1. **Open Host Screen on TV/Laptop:**
   - Navigate to: `http://localhost:9001`
   - A 6-digit room code and QR code will appear

2. **Connect Controllers (Phones):**
   - **Option 1:** Scan the QR code with your phone camera
   - **Option 2:** Manually navigate to `http://YOUR-LAPTOP-IP:3001` and enter room code

   **Finding your laptop IP:**
   - **Windows:** Open Command Prompt and type `ipconfig` (look for IPv4 Address)
   - **Mac:** Open Terminal and type `ifconfig | grep "inet "`
   - **Linux:** Open Terminal and type `hostname -I`
   - Example: `http://192.168.1.100:3001`

3. **Start Playing:**
   - Once players join the lobby, click "Start Game" on the host screen
   - Use phone touch controls to move players on the TV

**Option B: Local Testing Mode (No Phone Required)**

Perfect for solo development and testing:

1. Open: `http://localhost:9001`
2. Click **"Test Locally (No Phone)"** button
3. Select 1 or 2 players
4. Use keyboard controls:
   - **Player 1:** W (jump), A (left), D (right)
   - **Player 2:** ↑ (jump), ← (left), → (right)

### Step 4: Stopping the Game

Press `Ctrl+C` in the terminal where docker-compose is running, then:

```bash
docker-compose down
```

To completely remove all data and start fresh:
```bash
docker-compose down -v
```

---

## 🏗️ Project Structure

```
sofafriends/
├── server/              # FastAPI game server
│   ├── app/
│   │   ├── main.py     # WebSocket + REST API
│   │   └── __init__.py
│   ├── requirements.txt
│   └── Dockerfile
├── host/                # Host screen client
│   ├── index.html
│   └── game.js
├── controller/          # Phone controller client
│   ├── index.html
│   ├── controller.js
│   └── manifest.json   # PWA config
└── docker-compose.yml
```

---

## 🎮 How to Play

### Controls (Phone)
- **Left Side** - Move left
- **Top Right** - Jump
- **Bottom Right** - Action/Interact

### Goal
- Work together with all players
- Collect the key
- Reach the exit together
- Stand on the exit for 1.5s to win

---

## 🔧 Development

### Docker Commands Reference

**Basic Operations:**
```bash
# Start all services (rebuilds if needed)
docker-compose up --build

# Start in background/detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v

# Restart specific service
docker-compose restart server

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f server
```

**Debugging:**
```bash
# List running containers
docker ps

# Execute command in running container
docker-compose exec server bash

# Check resource usage
docker stats

# Rebuild only one service
docker-compose build server
docker-compose up -d server
```

**Clean Up:**
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove everything (use carefully!)
docker system prune -a
```

### Run Without Docker (Advanced)

If you prefer not to use Docker, you can run services manually:

**Prerequisites:**
- Python 3.11+
- Node.js 20+
- Redis server

**Terminal 1 - Redis:**
```bash
redis-server
```

**Terminal 2 - Backend Server:**
```bash
cd server
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 3 - Host Client:**
```bash
cd host
npx http-server -p 3000 --cors
```

**Terminal 4 - Controller Client:**
```bash
cd controller
npx http-server -p 3001 --cors
```

**Note:** Update WebSocket URLs in code to use `ws://localhost:8000` instead of `ws://localhost:9000`

### Finding Your Local IP (for phone connection)

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
# Example: 192.168.1.100
```

**Mac/Linux:**
```bash
# Mac
ipconfig getifaddr en0

# Linux
hostname -I
```

Then use `http://YOUR-IP:3001` on your phone to access the controller.

---

## 📡 Architecture

### Tech Stack
- **Backend:** Python 3.11 + FastAPI + WebSockets
- **Host Client:** Vanilla JS + Canvas (no framework)
- **Controller:** Progressive Web App (PWA)
- **Real-time:** WebSocket at 20 TPS (ticks per second)
- **Storage:** Redis (for room state)

### Data Flow
1. Host creates room via REST API → gets room code
2. Controllers join via WebSocket → appear in lobby
3. Host starts game → server begins 20 TPS game loop
4. Controllers send input → server updates physics → broadcasts state to host
5. Host renders at 60fps using interpolation

---

## 🎨 Customization

### Add More Players
Currently supports 8 players. To increase:
- Update `PLAYER_COLORS` array in `server/app/main.py`
- Adjust `max players` check in WebSocket handler

### Change Game Speed
- Adjust `TICK_RATE` in `server/app/main.py` (default: 20 TPS)
- Adjust `GRAVITY` constant for jump feel

### Modify Controller Layout
- Edit `controller/index.html` CSS grid
- Change button colors, sizes, or add new buttons

---

## 🐛 Troubleshooting

### Docker Issues

**Docker Desktop not starting:**
- Windows: Make sure WSL 2 is installed and updated
- Mac: Check System Preferences > Privacy & Security for blocked items
- Try restarting Docker Desktop
- Check Docker Desktop settings for resource allocation

**Port already in use errors:**
- Check if Stocktimus or another app is using ports 9000, 9001, or 3001
- Stop conflicting services or change ports in `docker-compose.yml`
- Use `docker ps` to see running containers

**Containers won't start:**
```bash
# View logs for specific service
docker-compose logs server
docker-compose logs host
docker-compose logs controller

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

### Game Connection Issues

**Phone can't connect to host:**
- Ensure phone and laptop are on **same WiFi network** (not cellular data)
- Check firewall isn't blocking ports 3001 or 9000
- Use `http://` not `https://` (no SSL in development)
- Try entering IP manually instead of scanning QR code
- Some corporate/school WiFi networks block device-to-device communication

**QR code not showing:**
- Check browser console for JavaScript errors (F12)
- Ensure QRCode.js library loaded from CDN
- Try refreshing the page
- Check that backend is running: `docker-compose logs server`

**Input lag or stuttering:**
- Check WebSocket connection (status indicator on phone)
- Reduce number of players if CPU is overloaded
- Check Docker Desktop resource allocation (increase if needed)
- Close other applications using CPU/network

**Game doesn't start:**
- Ensure at least 1 controller is connected
- Check server logs: `docker-compose logs server`
- Verify all containers are running: `docker ps`
- Try restarting: `docker-compose restart`

### Claude Code Issues

**Claude not responding:**
- Check your Claude subscription is active
- Run `/login` again to refresh authentication
- Check internet connection
- Try `/clear` to reset conversation

**Claude can't run commands:**
- Make sure you've granted terminal permissions in VS Code
- Check that Docker is running before asking Claude to start services

---

## 🚢 Deployment (Future)

For production deployment:
1. Add PostgreSQL for persistent user/room data
2. Use Redis for session management
3. Add HTTPS with Let's Encrypt
4. Deploy server to cloud (AWS/GCP/Heroku)
5. Use NGINX for static file serving
6. Add authentication with JWT

---

## 📝 Roadmap

- [ ] Level 1: Simple platforming + key collection
- [ ] Level 2: Shared block pushing mechanics
- [ ] Level 3: Pressure plate puzzles
- [ ] Reconnection handling for dropped players
- [ ] Ghost/respawn mechanic
- [ ] Phaser 3 integration for advanced graphics
- [ ] Sound effects and music
- [ ] Touch gesture improvements (tilt controls)
- [ ] Leaderboard and stats tracking

---

## 🤖 Using Claude Code with This Project

Once you have Claude Code set up in VS Code, here are some helpful ways to use it:

**Understanding the Codebase:**
- "Explain how the WebSocket connection works between host and controller"
- "Show me how player physics are calculated"
- "Where is the death animation system implemented?"
- "How does the level loading work?"

**Adding Features:**
- "Add a third level with moving platforms"
- "Implement a power-up system for players"
- "Add sound effects when players jump"
- "Create a settings menu to adjust game speed"

**Debugging:**
- "Why are players not jumping properly?"
- "The WebSocket connection keeps dropping, help me debug"
- "Players are falling through platforms, what's wrong?"

**Development Tasks:**
- "Start the Docker services for me"
- "Check the server logs for errors"
- "Run the game in local test mode"
- "Update the player colors to be more vibrant"

**Best Practices:**
- Claude can read your CLAUDE.md file (project instructions) automatically
- Reference specific files like "in [host/game.js](host/game.js), how does..."
- Ask Claude to run tests after making changes
- Use Claude to write documentation for new features

---

## 🤝 Contributing

This is a prototype project. To contribute:

1. **Fork the repo** and clone to your machine
2. **Install prerequisites** (Docker Desktop, optionally Claude Code)
3. **Create a feature branch:** `git checkout -b feature/your-feature-name`
4. **Make your changes** and test locally with `docker-compose up`
5. **Ask Claude** to help review your code (optional but recommended)
6. **Commit your changes:** `git commit -m "Add some feature"`
7. **Push to your fork:** `git push origin feature/your-feature-name`
8. **Submit a pull request** with a clear description of changes

**Development Tips:**
- Use the local testing mode to iterate quickly without needing phones
- Check the admin test panel at `http://localhost:9001/admin/test-panel.html`
- Review CLAUDE.md for detailed architecture and code structure
- Ask Claude to explain any code you don't understand

---

## 📄 License

MIT License - feel free to use for learning or your own party games!

---

## 🎉 Credits

Inspired by **Pico Park** - a brilliant co-op party game.

Built with ❤️ using Python, FastAPI, and WebSockets.

---

**Have fun! 🎮🕹️**