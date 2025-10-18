# Development Guide

Complete guide for developers working on SofaFriends.

## Table of Contents
- [Development Environment Setup](#development-environment-setup)
- [Architecture Overview](#architecture-overview)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Debugging](#debugging)
- [Common Development Tasks](#common-development-tasks)
- [Contributing](#contributing)

---

## Development Environment Setup

### Prerequisites

- **Docker Desktop** - For containerized development
- **VS Code** - Recommended editor
- **Git** - Version control
- **Claude Code** (optional) - AI coding assistant
- **Node.js 20+** (optional) - For running without Docker
- **Python 3.11+** (optional) - For running without Docker

### Recommended VS Code Extensions

```bash
# Open VS Code extensions panel and install:
```

- **Claude Code** - AI assistance (by Anthropic)
- **Docker** - Container management
- **Python** - Python language support
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Live Server** - Quick HTML preview
- **GitLens** - Enhanced Git features

### Initial Setup

1. **Clone repository:**
   ```bash
   git clone <your-repo-url>
   cd sofafriends
   ```

2. **Open in VS Code:**
   ```bash
   code .
   ```

3. **Install Docker Desktop:**
   - See [SETUP.md](SETUP.md) for installation instructions

4. **Verify Docker:**
   ```bash
   docker --version
   docker-compose --version
   ```

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Host Client (TV/Monitor) - Port 9001          │
│  ├── Vanilla JavaScript                        │
│  ├── Canvas rendering (1200x600)               │
│  ├── Physics engine (60 FPS)                   │
│  └── WebSocket client                          │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ WebSocket
                 │
┌────────────────▼────────────────────────────────┐
│                                                 │
│  Backend Server - Port 9000                     │
│  ├── FastAPI (Python)                           │
│  ├── WebSocket server                           │
│  ├── Room management                            │
│  └── Redis for state storage                   │
│                                                 │
└────────────────▲────────────────────────────────┘
                 │
                 │ WebSocket
                 │
┌────────────────┴────────────────────────────────┐
│                                                 │
│  Controller Clients (Phones) - Port 3001       │
│  ├── Vanilla JavaScript                        │
│  ├── Touch controls                             │
│  ├── PWA capabilities                           │
│  └── WebSocket client                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend (Host & Controller):**
- Pure vanilla JavaScript (no frameworks)
- HTML5 Canvas for rendering
- CSS3 for styling
- WebSocket API for real-time communication
- PWA features (service worker, manifest)

**Backend:**
- Python 3.11
- FastAPI web framework
- WebSockets (via `fastapi.websockets`)
- Redis for in-memory storage
- Uvicorn ASGI server

**Infrastructure:**
- Docker Compose for orchestration
- Redis 7 Alpine
- Node.js 20 Alpine (for static file serving)
- Nginx http-server (via npx)

### Port Configuration

| Service | Internal Port | External Port | Purpose |
|---------|--------------|---------------|---------|
| Backend | 8000 | 9000 | API & WebSocket |
| Host | 3000 | 9001 | TV game screen |
| Controller | 3001 | 3001 | Phone controllers |
| Redis | 6379 | 6379 | Data storage |

**Why different ports?**
- Avoids conflicts with Stocktimus (main business app on 3000, 5432, 8000)
- Clear separation of concerns

---

## Running Locally

### Option 1: Docker (Recommended)

**Start all services:**
```bash
docker-compose up --build
```

**Start in background:**
```bash
docker-compose up -d
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f host
docker-compose logs -f controller
```

**Restart specific service:**
```bash
docker-compose restart server
```

**Stop everything:**
```bash
docker-compose down
```

**Clean restart (removes volumes):**
```bash
docker-compose down -v
docker-compose up --build
```

### Option 2: Manual (Without Docker)

Requires 4 terminal windows:

**Terminal 1 - Redis:**
```bash
# Install Redis first
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis
# Linux: sudo apt-get install redis

redis-server
```

**Terminal 2 - Backend:**
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

**Important:** If running manually, update WebSocket URLs in code:
- Host: `ws://localhost:8000/ws/` (not 9000)
- Controller: `ws://localhost:8000/ws/` (not 9000)

### Option 3: Hybrid (Backend in Docker, Frontend Local)

Useful for frontend-only development:

```bash
# Start only backend + redis
docker-compose up redis server

# In separate terminals, run host and controller manually
cd host && npx http-server -p 3000 --cors
cd controller && npx http-server -p 3001 --cors
```

---

## Project Structure

```
sofafriends/
├── server/                    # Backend Python API
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py           # FastAPI app, WebSocket handlers
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile            # Backend container config
│
├── host/                      # Host client (TV screen)
│   ├── index.html            # Main HTML structure
│   ├── game.js               # Game logic, physics, rendering
│   ├── admin/
│   │   └── test-panel.html   # Unit test panel
│   └── manifest.json         # PWA manifest
│
├── controller/                # Controller client (phone)
│   ├── index.html            # Controller UI
│   ├── controller.js         # Controller logic
│   ├── manifest.json         # PWA manifest
│   └── icon.png              # PWA icon
│
├── docs/                      # Documentation
│   ├── SETUP.md              # Installation guide
│   ├── GETTING_STARTED.md    # Quick start
│   ├── HOW_TO_PLAY.md        # Gameplay guide
│   └── DEVELOPMENT.md        # This file
│
├── docker-compose.yml         # Multi-container orchestration
├── CLAUDE.md                 # AI assistant instructions
└── README.md                 # Project overview
```

### Key Files Explained

**[server/app/main.py](../server/app/main.py):**
- FastAPI application setup
- REST API endpoints (create/join room)
- WebSocket connection handling
- Player connection management
- Room state management with Redis

**[host/game.js](../host/game.js) (1294 lines):**
- Game initialization and setup
- WebSocket client for host
- Game loop (60 FPS)
- Physics engine (gravity, collisions)
- Rendering system (Canvas API)
- Level definitions (Level 1 & 2)
- Death animations (5 types)
- Particle system
- Camera system
- Input handling (WebSocket and keyboard)

**[controller/controller.js](../controller/controller.js) (288 lines):**
- Join room logic
- WebSocket client for controller
- Touch control handlers
- Haptic feedback
- Wake lock management
- Input state management (20 Hz updates)

**[docker-compose.yml](../docker-compose.yml):**
- Service definitions (redis, server, host, controller)
- Port mappings
- Volume mounts
- Environment variables
- Service dependencies

---

## Development Workflow

### Making Changes

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes to code**

3. **Test locally:**
   ```bash
   docker-compose up --build
   ```

4. **Test in browser:**
   - Host: http://localhost:9001
   - Controller: http://YOUR-IP:3001
   - Or use local test mode

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "Add feature: description"
   ```

6. **Push to remote:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Hot Reload

**Python backend (automatic):**
- Changes to `server/app/main.py` reload automatically
- Uvicorn's `--reload` flag enables this
- No need to restart container

**Frontend (manual refresh):**
- Changes to HTML/JS files require browser refresh
- Press `Ctrl+R` or `Cmd+R` to reload
- Or use browser dev tools auto-refresh

**Tip:** Use browser dev tools with cache disabled for development.

### Using Claude Code

**Ask Claude to:**
- "Explain how the WebSocket connection works"
- "Add a new level with moving platforms"
- "Debug why players are falling through platforms"
- "Start Docker services"
- "Run the game in local test mode"

**Reference files:**
- "In [host/game.js](../host/game.js), how does collision detection work?"
- "Update the physics in [server/app/main.py](../server/app/main.py)"

---

## Testing

### Manual Testing

**Local Test Mode (fastest):**
1. Open http://localhost:9001
2. Click "Test Locally (No Phone)"
3. Select 1 or 2 players
4. Test with keyboard controls

**Full Multiplayer Test:**
1. Open http://localhost:9001 on computer
2. Open http://YOUR-IP:3001 on phone(s)
3. Join with room code
4. Test with real controllers

### Unit Tests

**Admin Test Panel:**
```
http://localhost:9001/admin/test-panel.html
```

Features:
- Run all tests with one click
- Manual controller testing tools
- Keyboard input testing
- WebSocket connection testing

**Creating New Tests:**

Add to `host/admin/test-panel.html`:

```javascript
function testYourFeature() {
  const result = yourFunction();
  const expected = expectedValue;
  return {
    name: "Your Feature Test",
    passed: result === expected,
    message: `Expected ${expected}, got ${result}`
  };
}

// Add to test suite
const tests = [
  // ... existing tests
  testYourFeature
];
```

### Testing Checklist

Before committing:
- [ ] Local test mode works (1 and 2 players)
- [ ] Multiplayer mode works (connect phone)
- [ ] No console errors (F12 → Console)
- [ ] Physics work correctly
- [ ] Death animations play
- [ ] Level completion works
- [ ] WebSocket reconnection works
- [ ] Admin test panel passes

---

## Debugging

### Browser DevTools

**Open DevTools:**
- Press `F12`
- Or right-click → Inspect

**Console Tab:**
- View `console.log()` output
- See JavaScript errors
- Run code snippets

**Network Tab:**
- Monitor WebSocket connections
- Check HTTP requests
- View request/response data

**Useful console commands:**
```javascript
// Check player state
players

// Check game state
currentLevel

// Force level completion
players.forEach(p => p.x = 2900);

// Kill player
players[0].alive = false;
```

### Docker Debugging

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
```

**Enter container:**
```bash
# Access bash in server container
docker-compose exec server bash

# Check running processes
docker-compose exec server ps aux
```

**Check container status:**
```bash
docker ps
docker stats
```

**Common issues:**

**Port conflict:**
```bash
# Find process using port
netstat -ano | findstr :9000  # Windows
lsof -i :9000                 # Mac/Linux

# Kill process or change port in docker-compose.yml
```

**Container won't start:**
```bash
# View detailed logs
docker-compose logs server

# Rebuild container
docker-compose build server
docker-compose up server
```

### WebSocket Debugging

**Check connection status:**
- Host: Green indicator in top-right
- Controller: Connection status bar at top

**Manual WebSocket test:**
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:9000/ws/ABC123');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', e.data);
ws.send(JSON.stringify({
  type: 'handshake',
  role: 'host',
  player_name: 'Test'
}));
```

**Common WebSocket issues:**
- Check backend is running: `docker-compose logs server`
- Verify room code is correct
- Check network connection
- Look for CORS errors in console

### Physics Debugging

**Enable debug rendering:**

Add to `host/game.js` render function:

```javascript
// Draw player hitboxes
ctx.strokeStyle = 'red';
players.forEach(p => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 25, 0, Math.PI * 2);
  ctx.stroke();
});

// Draw platform hitboxes
ctx.strokeStyle = 'blue';
platforms.forEach(plat => {
  ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
});
```

**Log player state:**
```javascript
console.log('Player position:', player.x, player.y);
console.log('Player velocity:', player.vx, player.vy);
console.log('On ground:', player.onGround);
```

---

## Common Development Tasks

### Adding a New Level

1. **Define level data in [host/game.js](../host/game.js):**

```javascript
function createLevel3() {
  return {
    platforms: [
      { x: 0, y: 500, width: 400, height: 20 },
      // Add more platforms
    ],
    obstacles: [
      { x: 450, y: 470, width: 40, height: 40 },
      // Add obstacles
    ]
  };
}
```

2. **Update level progression:**

```javascript
// In nextLevel() function
if (currentLevel === 2) {
  currentLevel = 3;
  loadLevel(createLevel3());
}
```

3. **Test the level:**
- Use local test mode for quick iteration
- Adjust platform positions
- Test obstacle placement

### Adding a New Death Animation

1. **Create animation function in [host/game.js](../host/game.js):**

```javascript
function yourDeathAnimation(player, callback) {
  const startTime = Date.now();
  const duration = 1500; // milliseconds

  player.dying = true;

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    if (progress >= 1) {
      callback(); // Animation complete
      return;
    }

    // Your animation logic here
    // Update player.x, player.y, etc.

    requestAnimationFrame(animate);
  }

  animate();
}
```

2. **Add to death animation array:**

```javascript
const deathAnimations = [
  bubblePopAnimation,
  springBounceAnimation,
  flowerBloomAnimation,
  origamiAnimation,
  pixelDisintegrationAnimation,
  yourDeathAnimation  // Add here
];
```

### Modifying Game Physics

**In [host/game.js](../host/game.js):**

```javascript
// Adjust gravity
const GRAVITY = 800; // Increase for faster falling

// Adjust move speed
const MOVE_SPEED = 260; // Increase for faster movement

// Adjust jump velocity
const JUMP_SPEED = -400; // More negative = higher jump

// Adjust player size
const PLAYER_RADIUS = 25; // Bigger = easier to hit obstacles
```

### Adding New Controller Buttons

1. **Update [controller/index.html](../controller/index.html):**

```html
<button id="special-btn" class="game-btn">Special</button>
```

2. **Add handler in [controller/controller.js](../controller/controller.js):**

```javascript
const specialBtn = document.getElementById('special-btn');

specialBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  inputState.special = true;
  vibrate();
});

specialBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  inputState.special = false;
});
```

3. **Handle in [host/game.js](../host/game.js):**

```javascript
// In handleMessage() function
if (data.type === 'input') {
  const player = players.find(p => p.id === data.player_id);
  if (player && data.special) {
    // Handle special action
    console.log('Special activated!');
  }
}
```

### Adjusting Camera Behavior

**In [host/game.js](../host/game.js):**

```javascript
// Faster camera (reduce lerp factor)
cameraX += (targetCameraX - cameraX) * 0.2; // Default: 0.1

// Camera follows average player position instead of rightmost
const avgX = players.reduce((sum, p) => sum + p.x, 0) / players.length;
const targetCameraX = Math.max(0, Math.min(avgX - 600, 3000 - 1200));
```

### Adding Sound Effects

1. **Add audio files to project:**
```bash
mkdir host/sounds
# Add jump.mp3, death.mp3, etc.
```

2. **Load sounds in [host/game.js](../host/game.js):**

```javascript
const sounds = {
  jump: new Audio('sounds/jump.mp3'),
  death: new Audio('sounds/death.mp3'),
  victory: new Audio('sounds/victory.mp3')
};
```

3. **Play sounds:**

```javascript
// On jump
if (player.onGround && inputs.jump) {
  player.vy = JUMP_SPEED;
  sounds.jump.play();
}

// On death
function handleDeath(player) {
  sounds.death.play();
  // ... rest of death logic
}
```

---

## Contributing

### Contribution Workflow

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/sofafriends.git
   cd sofafriends
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/sofafriends.git
   ```

4. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "Add: description of your changes"
   ```

6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request** on GitHub

### Code Style Guidelines

**JavaScript:**
- Use camelCase for variables and functions
- Use UPPER_CASE for constants
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

**Python:**
- Follow PEP 8 style guide
- Use snake_case for variables and functions
- Use type hints where appropriate
- Add docstrings to functions
- Keep functions under 50 lines when possible

**HTML/CSS:**
- Use kebab-case for classes and IDs
- Indent with 2 spaces
- Keep styles organized by component
- Use semantic HTML tags

### Commit Message Format

```
Type: Short description (50 chars or less)

Longer explanation if needed (wrap at 72 chars)

- Bullet points for details
- What changed and why
- Any breaking changes

Fixes #123
```

**Types:**
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Improve existing feature
- `Refactor:` Code restructure
- `Docs:` Documentation only
- `Test:` Add or update tests
- `Style:` Formatting changes

### Pull Request Checklist

Before submitting PR:
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No console errors
- [ ] Tested in local test mode
- [ ] Tested in multiplayer mode
- [ ] Comments added for complex code
- [ ] Documentation updated if needed
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

---

## Advanced Topics

### Performance Optimization

**Canvas rendering:**
- Only redraw changed areas (dirty rectangles)
- Use `requestAnimationFrame` properly
- Avoid creating objects in render loop
- Cache frequently used calculations

**Network optimization:**
- Compress WebSocket messages
- Send only changed state
- Implement delta compression
- Add network prediction

**Physics optimization:**
- Use spatial partitioning for collision detection
- Only check nearby objects
- Use simpler collision shapes where possible

### Security Considerations

**Input validation:**
- Validate all WebSocket messages
- Sanitize player names
- Rate limit connections
- Prevent injection attacks

**Room codes:**
- Make codes hard to guess
- Expire old rooms
- Limit room creation rate
- Prevent room flooding

### Scaling for More Players

To support 16+ players:

1. **Update player colors** in `server/app/main.py`
2. **Adjust camera system** to follow group better
3. **Increase level width** for more space
4. **Optimize rendering** for more entities
5. **Consider server-side physics** for large groups

---

## Resources

### Documentation

- **FastAPI:** https://fastapi.tiangolo.com/
- **Docker:** https://docs.docker.com/
- **Canvas API:** https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **WebSocket API:** https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

### Tools

- **Claude Code:** https://docs.claude.com/claude-code
- **VS Code:** https://code.visualstudio.com/docs
- **Docker Desktop:** https://docs.docker.com/desktop/

### Learning Resources

- **Game development:** https://developer.mozilla.org/en-US/docs/Games
- **Physics engines:** https://brm.io/matter-js/
- **WebSocket patterns:** https://www.pubnub.com/guides/websockets/

---

## Getting Help

**Using Claude Code:**
```
Ask: "How do I add a moving platform to the game?"
Ask: "Debug this collision detection issue"
Ask: "Explain the death animation system"
```

**Community:**
- Check existing GitHub issues
- Read CLAUDE.md for project context
- Review code comments
- Test in local mode first

---

**Previous:** [← How to Play](HOW_TO_PLAY.md)
