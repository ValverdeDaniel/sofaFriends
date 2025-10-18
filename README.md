# 🎮 SofaFriends

A Pico-Park-style couch co-op party game where one screen is the "stage" and up to 8 phones become controllers.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Modern web browser
- Smartphone(s) on the same WiFi network

### Run the Game

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Open Host Screen (TV/Laptop):**
   - Navigate to: `http://localhost:3000`
   - A room code and QR code will appear

3. **Connect Controllers (Phones):**
   - Scan the QR code OR
   - Navigate to: `http://YOUR-LAPTOP-IP:3001`
   - Enter the 6-character room code

4. **Start Playing:**
   - Once players join, click "Start Game" on the host screen
   - Use phone controls to move players on the TV

### 🧪 Local Testing Mode (No Phone Required)

Can't connect your phone? Test locally on your laptop:

1. **Open host screen:** `http://localhost:3000`
2. **Click "Test Locally (No Phone)"** button
3. **Play with keyboard:**
   - **Player 1:** W=Jump, A=Left, D=Right
   - **Player 2:** ↑=Jump, ←=Left, →=Right

This spawns 2 players you can control with your keyboard - perfect for testing game mechanics!

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

### Run Without Docker

**Server:**
```bash
cd server
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Host Client:**
```bash
cd host
npx http-server -p 3000 --cors
```

**Controller Client:**
```bash
cd controller
npx http-server -p 3001 --cors
```

### Finding Your Local IP (for phone connection)

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

**Mac/Linux:**
```bash
ifconfig
# Look for "inet" under en0 or wlan0
```

Then use `http://YOUR-IP:3001` on your phone.

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

### Phone can't connect to host
- Ensure phone and laptop are on **same WiFi network**
- Check firewall isn't blocking ports 3001 or 8000
- Use `http://` not `https://` (no SSL in dev)

### QR code not showing
- Check console for JavaScript errors
- Ensure QRCode.js library loaded from CDN

### Input lag or stuttering
- Check WebSocket connection (status indicator on phone)
- Reduce number of players if CPU is overloaded
- Lower TICK_RATE to 15 if needed

### Game doesn't start
- Ensure at least 1 controller is connected
- Check server logs: `docker-compose logs server`

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

## 🤝 Contributing

This is a prototype. To contribute:
1. Fork the repo
2. Create a feature branch
3. Test locally with `docker-compose up`
4. Submit a pull request

---

## 📄 License

MIT License - feel free to use for learning or your own party games!

---

## 🎉 Credits

Inspired by **Pico Park** - a brilliant co-op party game.

Built with ❤️ using Python, FastAPI, and WebSockets.

---

**Have fun! 🎮🕹️**
